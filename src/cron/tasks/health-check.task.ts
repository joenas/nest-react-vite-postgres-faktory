import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { FaktoryService } from "../../faktory/faktory.service";
import { ConfigService } from "../../config/config.service";

/**
 * Health Check Ping Task
 * Runs every 5 minutes
 * Queues ping job to ping health check URL
 */
@Injectable()
export class HealthCheckTask {
  private readonly logger = new Logger(HealthCheckTask.name);

  constructor(
    private readonly faktoryService: FaktoryService,
    private readonly configService: ConfigService
  ) {}

  @Cron("*/5 * * * *", {
    timeZone: process.env.TZ || "UTC",
  })
  async handleCron() {
    const pingUrl = this.configService.pingUrlCron;

    if (!pingUrl) {
      this.logger.debug("PING_URL_CRON not configured, skipping health check");
      return;
    }

    this.logger.debug("Starting scheduled health check ping");

    try {
      await this.faktoryService.performAsync("app:ping-job", {
        url: pingUrl,
        method: "GET",
      });

      this.logger.debug(`Queued health check ping to: ${pingUrl}`);
    } catch (error) {
      this.logger.error("Error queuing health check ping:", error);
    }
  }
}
