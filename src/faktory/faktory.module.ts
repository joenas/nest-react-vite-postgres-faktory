import { Module, Global } from "@nestjs/common";
import { FaktoryService } from "./faktory.service";
import { FaktoryWorkerService } from "./faktory-worker.service";
import { ConfigModule } from "../config/config.module";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [FaktoryService, FaktoryWorkerService],
  exports: [FaktoryService, FaktoryWorkerService],
})
export class FaktoryModule {}
