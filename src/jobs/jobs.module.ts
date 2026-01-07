import { Module, OnModuleInit } from "@nestjs/common";
import { FaktoryModule } from "../faktory/faktory.module";
import { FaktoryWorkerService } from "../faktory/faktory-worker.service";

// Job handlers
import { PingHandler } from "./handlers/ping.handler";

/**
 * JobsModule
 *
 * Contains only Faktory job handlers and worker initialization.
 *
 * This module should only be loaded when running the full application
 * (not for CLI commands).
 */
@Module({
  imports: [FaktoryModule],
  providers: [
    // Job handlers (thin wrappers that delegate to commands)
    PingHandler,
  ],
})
export class JobsModule implements OnModuleInit {
  constructor(private readonly faktoryWorkerService: FaktoryWorkerService) {}

  async onModuleInit() {
    // Register all job handlers
    await this.faktoryWorkerService.registerJobHandlers([PingHandler]);

    // Start the worker after all jobs are registered
    await this.faktoryWorkerService.start();
  }
}
