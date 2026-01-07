/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface NewsSourceDto {
  /** The ID of the news source */
  id: string;
  /** The name of the news source */
  name: string;
  /** The avatar URL of the news source */
  avatar_url: string;
  /** The feed URLs of the news source */
  feed_urls: string[];
  /** The minimum count of the news source */
  min_count: number;
  /** Average share count for this source (computed over items with share_count > 0) */
  shares_average: number;
  /** Median share count for this source (computed over items with share_count > 0) */
  shares_median: number;
  /** The pass rate percentage of the news source */
  pass_rate_percent: number;
  /** The lookback interval for the share stats */
  stats_lookback_interval: string;
  /** The sample size for the share stats */
  shares_sample_size: number;
  /** The 75th percentile of the share stats */
  shares_p75: number;
  /** The max share count for the share stats */
  shares_max: number;
  /**
   * The created at date of the news source
   * @format date-time
   */
  created_at: string;
  /**
   * The updated at date of the news source
   * @format date-time
   */
  updated_at: string;
}

export interface CreateNewsSourceDto {
  name: string;
  avatar_url?: string;
  feed_urls: string[];
  min_count: number;
}

export interface UpdateNewsSourceDto {
  name: string;
  avatar_url: string;
  feed_urls: string[];
  min_count: number;
}

export interface NewsItemDto {
  /** The ID of the news item */
  id: string;
  /** The title of the news item */
  title: string;
  /** The description of the news item */
  description: string;
  /** The image of the news item */
  image: string;
  /** The URL of the news item */
  url: string;
  /** The source of the news item */
  source: string;
  /** The news source ID of the news item */
  news_source_id: number;
  /** The minimum count of the news item */
  min_count: number;
  /**
   * The created at date of the news item
   * @format date-time
   */
  created_at: string;
  /**
   * The updated at date of the news item
   * @format date-time
   */
  updated_at: string;
  /** The content of the news item */
  content: string;
  /** The share count of the news item */
  share_count: number;
  /** The views of the news item */
  views: number;
  /**
   * The published at date of the news item
   * @format date-time
   */
  published_at: string;
  /**
   * The fetched at date of the news item
   * @format date-time
   */
  fetched_at: string;
}

export interface NewsItemListDto {
  /** The IDs of the news items */
  ids: string[];
  /** The news items */
  items: Record<string, NewsItemDto>;
}

export interface NewsItemDetailDto {
  /** The news item */
  item: object;
}

export interface MeDto {
  username: string;
  role: string;
}

export interface AdminStatsDto {
  /** @example 12345 */
  total_items: number;
  /** @example 123 */
  missing_fetched_at: number;
  /** @example 456 */
  missing_content: number;
  /** @example 789 */
  missing_embedding: number;
  /** @example 321 */
  missing_embedding_with_content: number;
  /** @example 200 */
  embedded_items: number;
  /** @example 50 */
  created_last_24h: number;
  /** @example 40 */
  fetched_last_24h: number;
  /** @example 25 */
  published_last_24h: number;
  /** @example 12 */
  sources_total: number;
  /** @example 100 */
  items_passing_min_count: number;
  /** @example 23 */
  items_failing_min_count: number;
  /** @example "2026-01-05T12:34:56.000Z" */
  max_created_at?: string | null;
  /** @example "2026-01-05T12:34:56.000Z" */
  max_fetched_at?: string | null;
  /** @example "2026-01-05T12:34:56.000Z" */
  max_published_at?: string | null;
}

export interface BackfillFetchContentRequestDto {
  /**
   * How many items to enqueue fetch jobs for
   * @min 0
   * @default 500
   */
  limit?: number;
  /**
   * Optional delay between jobs in milliseconds (spreads load over time)
   * @min 0
   * @default 0
   */
  spreadMs?: number;
}

export interface BackfillFetchContentResponseDto {
  /**
   * Number of jobs enqueued
   * @example 123
   */
  enqueued?: number;
}

export interface BackfillEmbeddingsRequestDto {
  /**
   * How many items to attempt embedding backfill for
   * @min 0
   * @default 200
   */
  limit?: number;
  /**
   * If true, try to fetch missing content before embedding generation
   * @default true
   */
  fetchMissingContent?: boolean;
  /**
   * If true, do not write embeddings to DB (still counts what would update)
   * @default false
   */
  dryRun?: boolean;
}

export interface BackfillEmbeddingsResponseDto {
  /** @example "enqueued" */
  status?: string;
}
