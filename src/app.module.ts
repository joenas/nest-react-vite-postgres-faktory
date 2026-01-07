import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "./config/config.module";
import { DatabaseModule } from "./database/database.module";
import { FaktoryModule } from "./faktory/faktory.module";
import { JobsModule } from "./jobs/jobs.module";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { CronModule } from "./cron/cron.module";
import { SharedModule } from "./shared/shared.module";
import { SentryModule } from "./sentry/sentry.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";

@Module({
  imports: [
    ConfigModule,
    SentryModule,
    DatabaseModule,
    FaktoryModule,
    JobsModule,
    AuthModule,
    HealthModule,
    CronModule,
    SharedModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
