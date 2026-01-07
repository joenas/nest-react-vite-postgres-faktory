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

import {
  AdminStatsDto,
  BackfillEmbeddingsRequestDto,
  BackfillEmbeddingsResponseDto,
  BackfillFetchContentRequestDto,
  BackfillFetchContentResponseDto,
  CreateNewsSourceDto,
  MeDto,
  NewsItemDetailDto,
  NewsItemListDto,
  NewsSourceDto,
  UpdateNewsSourceDto,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Api<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags news-sources
   * @name NewsSourcesControllerGetNewsSources
   * @summary Get all news sources
   * @request GET:/api/news_sources
   * @secure
   */
  newsSourcesControllerGetNewsSources = (params: RequestParams = {}) =>
    this.request<NewsSourceDto[], any>({
      path: `/api/news_sources`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags news-sources
   * @name NewsSourcesControllerCreateNewsSource
   * @summary Create a new news source
   * @request POST:/api/news_sources
   * @secure
   */
  newsSourcesControllerCreateNewsSource = (
    data: CreateNewsSourceDto,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/api/news_sources`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags news-sources
   * @name NewsSourcesControllerGetStats
   * @summary Get news sources statistics
   * @request GET:/api/news_sources/stats
   * @secure
   */
  newsSourcesControllerGetStats = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/news_sources/stats`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags news-sources
   * @name NewsSourcesControllerGetNewsSource
   * @summary Get a news source by ID
   * @request GET:/api/news_sources/{id}
   * @secure
   */
  newsSourcesControllerGetNewsSource = (
    id: number,
    params: RequestParams = {},
  ) =>
    this.request<NewsSourceDto, any>({
      path: `/api/news_sources/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags news-sources
   * @name NewsSourcesControllerUpdateNewsSource
   * @summary Update a news source
   * @request PUT:/api/news_sources/{id}
   * @secure
   */
  newsSourcesControllerUpdateNewsSource = (
    id: number,
    data: UpdateNewsSourceDto,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/api/news_sources/${id}`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags news-items
   * @name NewsItemsControllerCheckUpdates
   * @summary Check for updates
   * @request HEAD:/api/news_items
   */
  newsItemsControllerCheckUpdates = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/news_items`,
      method: "HEAD",
      ...params,
    });
  /**
   * No description
   *
   * @tags news-items
   * @name NewsItemsControllerGetNewsItems
   * @summary Get news items
   * @request GET:/api/news_items
   */
  newsItemsControllerGetNewsItems = (
    query: {
      page: string;
      limit: string;
      /** When used with pagination (page & limit), only return items with posted_at set (i.e. deemed interesting). */
      posted_only?: boolean;
    },
    params: RequestParams = {},
  ) =>
    this.request<NewsItemListDto, void>({
      path: `/api/news_items`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags news-items
   * @name NewsItemsControllerSearch
   * @summary Search news items
   * @request GET:/api/news_items/search
   */
  newsItemsControllerSearch = (
    query: {
      q: string;
      limit?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<NewsItemListDto, any>({
      path: `/api/news_items/search`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags news-items
   * @name NewsItemsControllerSimilar
   * @summary Get similar news items
   * @request GET:/api/news_items/{id}/similar
   */
  newsItemsControllerSimilar = (
    id: string,
    query?: {
      limit?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<NewsItemListDto, any>({
      path: `/api/news_items/${id}/similar`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags news-items
   * @name NewsItemsControllerGetNewsItem
   * @summary Get a news item by ID
   * @request GET:/api/news_items/{id}
   */
  newsItemsControllerGetNewsItem = (id: string, params: RequestParams = {}) =>
    this.request<NewsItemDetailDto, any>({
      path: `/api/news_items/${id}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name AuthControllerLogin
   * @summary Start OIDC login (redirect)
   * @request GET:/api/auth/login
   */
  authControllerLogin = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/auth/login`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name AuthControllerCallback
   * @summary OIDC callback
   * @request GET:/api/auth/callback
   */
  authControllerCallback = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/auth/callback`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name AuthControllerLogout
   * @summary Logout
   * @request POST:/api/auth/logout
   */
  authControllerLogout = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/auth/logout`,
      method: "POST",
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name AuthControllerLogoutRedirect
   * @summary Logout (redirect)
   * @request GET:/api/auth/logout
   */
  authControllerLogoutRedirect = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/auth/logout`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name AuthControllerGetMe
   * @summary Get current user
   * @request GET:/api/auth/me
   * @secure
   */
  authControllerGetMe = (params: RequestParams = {}) =>
    this.request<MeDto, void>({
      path: `/api/auth/me`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin
   * @name AdminControllerGetStats
   * @summary Admin stats: missing fetched_at/content, missing embeddings, and rollups
   * @request GET:/api/admin/stats
   * @secure
   */
  adminControllerGetStats = (params: RequestParams = {}) =>
    this.request<AdminStatsDto, any>({
      path: `/api/admin/stats`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin
   * @name AdminControllerBackfillFetchContent
   * @summary Enqueue fetch-content backfill jobs
   * @request POST:/api/admin/jobs/backfill-fetch-content
   * @secure
   */
  adminControllerBackfillFetchContent = (
    data: BackfillFetchContentRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<BackfillFetchContentResponseDto, any>({
      path: `/api/admin/jobs/backfill-fetch-content`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin
   * @name AdminControllerBackfillEmbeddings
   * @summary Backfill embeddings for items missing them
   * @request POST:/api/admin/jobs/backfill-embeddings
   * @secure
   */
  adminControllerBackfillEmbeddings = (
    data: BackfillEmbeddingsRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<BackfillEmbeddingsResponseDto, any>({
      path: `/api/admin/jobs/backfill-embeddings`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
}
