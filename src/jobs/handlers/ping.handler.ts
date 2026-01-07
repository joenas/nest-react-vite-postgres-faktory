import { Injectable } from "@nestjs/common";
import { FaktoryJob } from "../../faktory/decorators/faktory-job.decorator";
import { WebhookService } from "../../shared/services/webhook.service";

@Injectable()
export class PingHandler {
  constructor(private readonly webhookService: WebhookService) {}

  @FaktoryJob("app:ping-job", "low_priority")
  async perform(args: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
  }): Promise<void> {
    await this.webhookService.ping(
      args.url,
      args.method || "GET",
      args.headers || {}
    );
  }
}
