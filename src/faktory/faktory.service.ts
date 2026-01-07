import { Injectable, OnModuleDestroy, Logger } from "@nestjs/common";
import { Client } from "faktory-worker";
import { ConfigService } from "../config/config.service";

export interface JobOptions {
  queue?: string;
  priority?: number;
  retry?: number;
  reserveFor?: number;
  at?: Date;
  in?: number; // milliseconds
}

@Injectable()
export class FaktoryService implements OnModuleDestroy {
  private readonly logger = new Logger(FaktoryService.name);
  private client: Client;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      host: process.env.FAKTORY_HOST || "127.0.0.1",
      port: parseInt(process.env.FAKTORY_PORT || "7419", 10),
      password: this.configService.faktoryPassword,
    });
  }

  async onModuleDestroy() {
    await this.close();
  }

  /**
   * Push a job to Faktory
   * @param jobName - The job name (e.g., 'app:ping-job')
   * @param args - Job arguments
   * @param options - Job options (queue, priority, retry, etc.)
   * @returns Job ID
   */
  async performAsync(
    jobName: string,
    args: any = {},
    options?: JobOptions
  ): Promise<string> {
    const jobOptions: any = {
      jid: this.generateJobId(),
      jobtype: jobName,
      args: [args],
      queue: options?.queue || "default",
    };

    if (options?.priority !== undefined) {
      jobOptions.priority = options.priority;
    }

    if (options?.retry !== undefined) {
      jobOptions.retry = options.retry;
    }

    if (options?.reserveFor !== undefined) {
      jobOptions.reserve_for = options.reserveFor;
    }

    if (options?.at) {
      jobOptions.at = options.at.toISOString();
    }

    if (options?.in !== undefined) {
      const at = new Date(Date.now() + options.in);
      jobOptions.at = at.toISOString();
    }

    try {
      await this.client.push(jobOptions);
      return jobOptions.jid;
    } catch (error: any) {
      // Error handling similar to old implementation
      this.logger.error(`Error queueing job ${jobName}`, args);
      this.logger.error(error);
      throw error;
    }
  }

  /**
   * Schedule a job to run at a specific time
   */
  async performAt(
    jobName: string,
    args: any,
    date: Date,
    options?: Omit<JobOptions, "at" | "in">
  ): Promise<string> {
    return this.performAsync(jobName, args, { ...options, at: date });
  }

  /**
   * Schedule a job to run after a delay
   */
  async performIn(
    jobName: string,
    args: any,
    milliseconds: number,
    options?: Omit<JobOptions, "at" | "in">
  ): Promise<string> {
    return this.performAsync(jobName, args, { ...options, in: milliseconds });
  }

  /**
   * Close the Faktory client connection
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
    }
  }

  /**
   * Generate a unique job ID
   */
  private generateJobId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
