import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { join } from "path";
import * as Sentry from "@sentry/node";
import { AppModule } from "./app.module";
import { ConfigService } from "./config/config.service";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { SentryService } from "./sentry/sentry.service";
import { SentryInterceptor } from "./sentry/sentry.interceptor";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  // Initialize Sentry early to catch errors during bootstrap
  const sentryDsn = process.env.SENTRY_DSN;
  const nodeEnv = process.env.NODE_ENV || "development";
  const isProduction = nodeEnv === "production";

  if (sentryDsn) {
    try {
      Sentry.init({
        dsn: sentryDsn,
        environment: nodeEnv,
        tracesSampleRate: isProduction ? 0.1 : 1.0,
        profilesSampleRate: isProduction ? 0.1 : 1.0,
        integrations: [Sentry.httpIntegration(), Sentry.expressIntegration()],
      });
      logger.log("Sentry initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize Sentry:", error);
    }
  } else {
    logger.warn("Sentry DSN not configured. Error tracking will be disabled.");
  }

  // Enable verbose logging in development
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger:
      process.env.NODE_ENV === "production"
        ? ["error", "warn", "log"]
        : ["error", "warn", "log", "debug", "verbose"],
  });

  // Enable shutdown hooks for graceful shutdown
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);

  // Serve static files from frontend in production
  if (configService.nodeEnv === "production") {
    const frontendPath = join(__dirname, "..", "frontend", "dist");

    // Serve static assets (JS, CSS, images, etc.) from /app path
    app.useStaticAssets(frontendPath, {
      prefix: "/app",
      index: false,
    });
  }

  // CORS configuration
  const allowedOrigins = configService.corsAllowedOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  app.enableCors({
    origin: allowedOrigins.includes("*") ? true : allowedOrigins,
    credentials: true,
  });

  // Cookie parser middleware
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Global exception filter with Sentry integration
  const sentryService = app.get(SentryService, { strict: false });
  app.useGlobalFilters(new HttpExceptionFilter(sentryService));

  // Global Sentry interceptor for request tracking
  if (sentryService) {
    app.useGlobalInterceptors(new SentryInterceptor(sentryService));
  }

  // Swagger/OpenAPI documentation
  if (configService.nodeEnv !== "production") {
    const config = new DocumentBuilder()
      .setTitle("App API")
      .setDescription("API Documentation")
      .setVersion("2.0")
      .addTag("auth", "Authentication endpoints")
      .addCookieAuth("access_token")
      .addApiKey(
        {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "API Key for static site authentication",
        },
        "api-key"
      )
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "API Key",
          description:
            "API Key via Bearer token (alternative to X-API-Key header)",
        },
        "api-key-bearer"
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);
    logger.log(
      `Swagger documentation available at: http://localhost:${configService.port}/api/docs`
    );
  }

  // Simple root route handler
  const express = app.getHttpAdapter().getInstance();
  express.get("/", (req: any, res: any) => {
    res.json({
      message: "API",
      version: "2.0",
      docs: configService.nodeEnv !== "production" ? "/api/docs" : undefined,
    });
  });

  // Serve frontend SPA in production (must be after all routes are registered)
  if (configService.nodeEnv === "production") {
    const frontendPath = join(__dirname, "..", "frontend", "dist");

    // Serve index.html for /app routes, this must be registered after all other routes
    express.get("/app/*", (req: any, res: any) => {
      res.sendFile(join(frontendPath, "index.html"));
    });
  }

  const port = configService.port;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Environment: ${configService.nodeEnv}`);
  logger.log(
    `Logging level: ${process.env.NODE_ENV === "production" ? "production" : "verbose"}`
  );

  // Graceful shutdown handler
  // enableShutdownHooks() already sets up SIGTERM and SIGINT handlers,
  // but we add explicit handlers to ensure app.close() is called
  const gracefulShutdown = async (signal: string) => {
    logger.log(`Received ${signal}, starting graceful shutdown...`);
    try {
      await app.close();
      logger.log("Application closed successfully");
      process.exit(0);
    } catch (error) {
      logger.error("Error during shutdown:", error);
      process.exit(1);
    }
  };

  // Handle termination signals (SIGINT is sent by Ctrl-C)
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

bootstrap();
