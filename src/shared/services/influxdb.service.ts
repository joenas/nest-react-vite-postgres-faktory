import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "../../config/config.service";
import * as Influx from "influx";

@Injectable()
export class InfluxDBService {
  private readonly logger = new Logger(InfluxDBService.name);
  private client: Influx.InfluxDB | null = null;

  constructor(private readonly configService: ConfigService) {
    const influxdbUrl = this.configService.influxdbUrl;
    if (influxdbUrl) {
      try {
        this.client = new Influx.InfluxDB(influxdbUrl);
        this.logger.log("InfluxDB client initialized");
      } catch (error) {
        this.logger.error("Failed to initialize InfluxDB client:", error);
      }
    }
  }

  /**
   * Check if InfluxDB is configured
   */
  isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Write points to InfluxDB
   */
  async writePoints(points: Influx.IPoint[]): Promise<void> {
    if (!this.client) {
      this.logger.debug("InfluxDB not configured, skipping write");
      return;
    }

    try {
      await this.client.writePoints(points);
      this.logger.debug(`Wrote ${points.length} points to InfluxDB`);
    } catch (error: any) {
      this.logger.error("Failed to write points to InfluxDB:", error);
      throw error;
    }
  }
}
