import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "../config/config.module";
import { EmbeddingService } from "./services/embedding.service";
import { WebhookService } from "./services/webhook.service";
import { InfluxDBService } from "./services/influxdb.service";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [EmbeddingService, WebhookService, InfluxDBService],
  exports: [EmbeddingService, WebhookService, InfluxDBService],
})
export class SharedModule {}
