import { Injectable } from "@nestjs/common";
import * as Sentry from "@sentry/node";
import { ConfigService } from "../config/config.service";

@Injectable()
export class SentryService {
  private readonly isEnabled: boolean;

  constructor(private configService: ConfigService) {
    this.isEnabled = !!this.configService.sentryDsn;
  }

  /**
   * Report an error to Sentry
   */
  report(error: unknown): void {
    if (!this.isEnabled) return;
    Sentry.captureException(error);
  }

  /**
   * Set tags on the current scope
   */
  setTags(tags: Record<string, string>): void {
    if (!this.isEnabled) return;
    Sentry.withScope((scope) => {
      Object.keys(tags).forEach((key) => {
        scope.setTag(key, tags[key]);
      });
    });
  }
}
