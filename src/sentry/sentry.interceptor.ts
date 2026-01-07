import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs";
import * as Sentry from "@sentry/node";
import { SentryService } from "./sentry.service";

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  constructor(private sentryService: SentryService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    // Set user context if available
    if (user) {
      Sentry.setUser({
        id: user.id?.toString(),
        email: user.email,
        username: user.username,
      });
    }

    return next.handle().pipe(
      catchError((error) => {
        // Re-throw to let the exception filter handle it
        return throwError(() => error);
      })
    );
  }
}
