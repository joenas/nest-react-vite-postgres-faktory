import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { FaktoryModule } from "../faktory/faktory.module";
import { ConfigModule } from "../config/config.module";
import { HealthCheckTask } from "./tasks/health-check.task";

@Module({
  imports: [ScheduleModule.forRoot(), FaktoryModule, ConfigModule],
  providers: [HealthCheckTask],
})
export class CronModule {}
