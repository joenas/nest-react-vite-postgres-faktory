import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  Optional,
} from "@nestjs/common";
import { Worker } from "faktory-worker";
import { ConfigService } from "../config/config.service";
import { ModuleRef } from "@nestjs/core";
import {
  FAKTORY_JOB_METADATA,
  FaktoryJobMetadata,
} from "./decorators/faktory-job.decorator";
import { SentryService } from "../sentry/sentry.service";

export interface JobHandler {
  perform(args: any): Promise<void>;
}

@Injectable()
export class FaktoryWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FaktoryWorkerService.name);
  private worker: Worker;
  private registeredJobs = new Map<
    string,
    { handler: JobHandler; queue: string }
  >();

  constructor(
    private readonly configService: ConfigService,
    private readonly moduleRef: ModuleRef,
    @Optional() private readonly sentryService?: SentryService
  ) {}

  async onModuleInit() {
    // Don't start automatically - wait for jobs to be registered first
    // The start() will be called after job registration
  }

  async onModuleDestroy() {
    await this.stop();
  }

  /**
   * Register a job handler
   * @param jobName - The job name
   * @param handler - The handler instance
   * @param queue - Optional queue name
   */
  async registerJob(
    jobName: string,
    handler: JobHandler,
    queue: string = "default"
  ): Promise<void> {
    this.registeredJobs.set(jobName, { handler, queue });
    this.logger.log(`Registered job handler: ${jobName} (queue: ${queue})`);

    // If worker is already started, register this job with it immediately
    // This allows for dynamic job registration after worker startup
    if (this.worker) {
      this.registerJobWithWorker(jobName, handler);
    }
  }

  /**
   * Internal method to register a job with the worker instance
   * @param jobName - The job name
   * @param handler - The handler instance
   */
  private registerJobWithWorker(jobName: string, handler: JobHandler): void {
    // The faktory-worker register function receives args directly: (...args: unknown[])
    // Since we push jobs with args: [args], the handler receives an array with one element
    this.worker.register(jobName, async (...args: unknown[]) => {
      // Extract the first argument (the actual job args object)
      const jobArgs = (args && args.length > 0 ? args[0] : {}) as any;

      // Try to get job ID from args if available (for logging)
      const jid = jobArgs?.jid || "unknown";

      this.logger.debug(`Processing job: ${jobName} (jid: ${jid})`);
      try {
        await handler.perform(jobArgs);
        this.logger.debug(
          `Job ${jobName} (jid: ${jid}) completed successfully`
        );
      } catch (error: any) {
        // Log the error with full context (similar to old exceptionReporter.report)
        this.logger.error(
          `Job ${jobName} (jid: ${jid}) failed: ${error.message}`,
          error.stack
        );
        // Report to Sentry
        if (this.sentryService) {
          this.sentryService.setTags({
            job_name: jobName,
            job_id: jid,
          });
          this.sentryService.report(error);
        }
        // Re-throw so Faktory can handle retries
        throw error;
      }
    });
  }

  /**
   * Register job handlers from providers using the @FaktoryJob decorator
   */
  async registerJobHandlers(providers: any[]): Promise<void> {
    for (const ProviderClass of providers) {
      // Get the instance from the module
      let instance: any;
      try {
        instance = this.moduleRef.get(ProviderClass, { strict: false });
      } catch (e) {
        this.logger.warn(
          `Could not get instance of ${ProviderClass.name}, skipping`
        );
        continue;
      }

      if (!instance) continue;

      const prototype = Object.getPrototypeOf(instance);
      if (!prototype) continue;

      const methodNames = Object.getOwnPropertyNames(prototype).filter(
        (name) =>
          name !== "constructor" && typeof prototype[name] === "function"
      );

      for (const methodName of methodNames) {
        const metadata: FaktoryJobMetadata | undefined = Reflect.getMetadata(
          FAKTORY_JOB_METADATA,
          prototype[methodName]
        );

        if (metadata) {
          const handler: JobHandler = {
            perform: async (args: any) => {
              return instance[methodName](args);
            },
          };

          await this.registerJob(metadata.jobName, handler, metadata.queue);
        }
      }
    }
  }

  /**
   * Start the Faktory worker
   */
  async start(): Promise<void> {
    if (this.worker) {
      this.logger.warn("Worker is already running");
      return;
    }

    // Collect all unique queues from registered jobs
    const queues = Array.from(
      new Set(
        Array.from(this.registeredJobs.values()).map((jobInfo) => jobInfo.queue)
      )
    );

    if (queues.length === 0) {
      queues.push("default"); // Default queue if no jobs registered
    }

    this.logger.log(`Worker will listen to queues: ${queues.join(", ")}`);

    // Configure worker with timeout and other options from old implementation
    // timeout: 25 seconds (25000ms) - time jobs have to complete after shutdown signal
    const workerOptions: any = {
      host: process.env.FAKTORY_HOST || "127.0.0.1",
      port: parseInt(process.env.FAKTORY_PORT || "7419", 10),
      password: this.configService.faktoryPassword,
      concurrency: this.configService.faktoryConcurrency,
      queues: queues,
      timeout: 25 * 1000, // 25 seconds - matches old implementation
      labels: [], // Can be configured via env if needed
    };

    this.worker = new Worker(workerOptions);

    // Register all jobs with the worker
    // Use the shared registration method to avoid code duplication
    for (const [jobName, jobInfo] of this.registeredJobs.entries()) {
      this.registerJobWithWorker(jobName, jobInfo.handler);
    }

    this.worker.on("fail", ({ job, error }: any) => {
      this.logger.error(`Job ${job.jid} (${job.jobtype}) failed:`, error);
      // Report to Sentry
      if (this.sentryService) {
        this.sentryService.setTags({
          job_name: job.jobtype,
          job_id: job.jid,
        });
        this.sentryService.report(error);
      }
    });

    this.worker.on("error", (error: any) => {
      this.logger.error("Worker error:", error);
      // Report to Sentry
      if (this.sentryService) {
        this.sentryService.report(error);
      }
    });

    this.worker.on("start", () => {
      this.logger.log("Faktory worker started");
    });

    this.worker.on("quiet", () => {
      this.logger.log("Faktory worker quieting");
    });

    this.logger.log(
      `Starting Faktory worker with concurrency: ${this.configService.faktoryConcurrency}`
    );

    // Start the worker - work() starts the fetch loop and job processing
    // Note: work() returns a promise that resolves when the worker stops
    // We don't await it here so it runs in the background
    this.worker.work().catch((error) => {
      this.logger.error("Worker error during execution:", error);
      // Report to Sentry
      if (this.sentryService) {
        this.sentryService.report(error);
      }
    });
  }

  /**
   * Stop the Faktory worker
   */
  async stop(): Promise<void> {
    if (this.worker) {
      await this.worker.stop();
      this.worker = null as any;
      this.logger.log("Faktory worker stopped");
    }
  }

  /**
   * Get the worker instance (for advanced usage)
   */
  getWorker(): Worker | null {
    return this.worker || null;
  }
}
