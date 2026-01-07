import { SetMetadata } from "@nestjs/common";

export const FAKTORY_JOB_METADATA = "faktory:job";

export interface FaktoryJobMetadata {
  jobName: string;
  queue?: string;
}

/**
 * Decorator to mark a method as a Faktory job handler
 * @param jobName - The job name (e.g., 'app:ping-job')
 * @param queue - Optional queue name (default: 'default')
 */
export const FaktoryJob = (jobName: string, queue: string = "default") => {
  return SetMetadata<typeof FAKTORY_JOB_METADATA, FaktoryJobMetadata>(
    FAKTORY_JOB_METADATA,
    { jobName, queue }
  );
};
