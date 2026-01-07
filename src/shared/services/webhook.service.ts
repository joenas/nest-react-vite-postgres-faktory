import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "../../config/config.service";
import { request } from "../utils/request.util";

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Post webhook notification
   */
  async postWebhook(
    url: string,
    data: any,
    headers: Record<string, string> = {}
  ): Promise<boolean> {
    try {
      const defaultHeaders = {
        "Content-Type": "application/json",
        ...headers,
      };

      await request(url, {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify(data),
        timeout: 10000,
      });

      this.logger.log(`Webhook posted successfully to ${url}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to post webhook to ${url}:`, error);
      return false;
    }
  }

  /**
   * Generic HTTP ping (for health checks, etc.)
   */
  async ping(
    url: string,
    method: string = "GET",
    headers: Record<string, string> = {}
  ): Promise<boolean> {
    try {
      await request(url, {
        method,
        headers,
        timeout: 10000,
      });

      this.logger.debug(`Ping successful to ${url}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Ping failed to ${url}:`, error);
      return false;
    }
  }
}
