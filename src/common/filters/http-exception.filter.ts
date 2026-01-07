import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { SentryService } from "../../sentry/sentry.service";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private sentryService: SentryService | null = null;

  constructor(sentryService?: SentryService) {
    // SentryService is optional - if not provided, we'll try to get it from context
    this.sentryService = sentryService || null;
  }

  private getSentryService(host: ArgumentsHost): SentryService | null {
    if (this.sentryService) {
      return this.sentryService;
    }

    try {
      // Try to get SentryService from the application context
      const app = host.switchToHttp().getRequest().app;
      if (app && app.get) {
        this.sentryService = app.get(SentryService, { strict: false });
      }
    } catch (error) {
      // SentryService not available, continue without it
    }

    return this.sentryService;
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal server error";

    // Log the error with full details
    const errorLog = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
      body: request.body,
      query: request.query,
      params: request.params,
    };

    if (status >= 500) {
      // Log internal server errors with full stack trace
      this.logger.error(
        `Internal Server Error: ${errorLog.message}`,
        exception instanceof Error ? exception.stack : String(exception),
        JSON.stringify(errorLog, null, 2)
      );
    } else {
      // Log client errors (4xx) with less detail
      this.logger.warn(
        `Client Error [${status}]: ${errorLog.message}`,
        JSON.stringify(
          {
            path: errorLog.path,
            method: errorLog.method,
            body: errorLog.body,
            query: errorLog.query,
          },
          null,
          2
        )
      );
    }

    // Report to Sentry for server errors
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const sentryService = this.getSentryService(host);
      if (sentryService) {
        sentryService.report(exception);
      }
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
