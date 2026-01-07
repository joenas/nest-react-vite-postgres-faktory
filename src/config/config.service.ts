import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";

@Injectable()
export class ConfigService {
  constructor(private nestConfigService: NestConfigService) {}

  // Database
  get databaseUrl(): string {
    return this.nestConfigService.get<string>("DATABASE_URL")!;
  }

  // Faktory
  get faktoryPassword(): string {
    return this.nestConfigService.get<string>("FAKTORY_PASSWORD")!;
  }

  get faktoryConcurrency(): number {
    return this.nestConfigService.get<number>("FAKTORY_CONCURRENCY", 5);
  }

  // JWT
  get jwtSecret(): string {
    return this.nestConfigService.get<string>("JWT_SECRET")!;
  }

  get jwtExpiresIn(): string {
    return this.nestConfigService.get<string>("JWT_EXPIRES_IN", "7d");
  }

  // API Keys
  get apiKeys(): string[] {
    const keys = this.nestConfigService.get<string>("API_KEYS", "");
    return keys
      .split(",")
      .map((key) => key.trim())
      .filter((key) => key.length > 0);
  }

  // OIDC
  get oidcIssuerUrl(): string {
    return this.nestConfigService.get<string>("OIDC_ISSUER")!;
  }

  get oidcClientId(): string {
    return this.nestConfigService.get<string>("OIDC_CLIENT_ID")!;
  }

  get oidcClientSecret(): string {
    return this.nestConfigService.get<string>("OIDC_CLIENT_SECRET")!;
  }

  get oidcRedirectUrl(): string {
    return this.nestConfigService.get<string>("OIDC_REDIRECT_URI")!;
  }

  get oidcScopes(): string {
    return this.nestConfigService.get<string>("OIDC_SCOPES", "openid email");
  }

  get frontendBaseUrl(): string {
    return this.nestConfigService.get<string>(
      "FRONTEND_BASE_URL",
      "http://localhost:4001/app"
    );
  }

  /**
   * Comma-separated emails that should be treated as admin users.
   * Optional. Example: "alice@example.com,bob@example.com"
   */
  get oidcAdminEmails(): string {
    return this.nestConfigService.get<string>("OIDC_ADMIN_EMAILS", "");
  }

  /**
   * Comma-separated usernames that should be treated as admin users.
   * Optional. Example: "alice,bob"
   */
  get oidcAdminUsernames(): string {
    return this.nestConfigService.get<string>("OIDC_ADMIN_USERNAMES", "");
  }

  // CORS
  get corsAllowedOrigin(): string {
    return this.nestConfigService.get<string>("CORS_ALLOWED_ORIGIN", "*");
  }

  // External services
  get sentryDsn(): string | undefined {
    return this.nestConfigService.get<string>("SENTRY_DSN");
  }

  get openaiApiKey(): string | undefined {
    return this.nestConfigService.get<string>("OPENAI_API_KEY");
  }

  get openaiBaseUrl(): string | undefined {
    return this.nestConfigService.get<string>("OPENAI_BASE_URL");
  }

  get openaiEmbedModel(): string {
    return this.nestConfigService.get<string>(
      "OPENAI_EMBED_MODEL",
      "text-embedding-3-small"
    );
  }

  get openaiEmbedMaxTokens(): number {
    return this.nestConfigService.get<number>("OPENAI_EMBED_MAX_TOKENS", 32000);
  }

  // Webhooks/URLs
  get pingUrlCron(): string | undefined {
    return this.nestConfigService.get<string>("PING_URL_CRON");
  }

  get influxdbUrl(): string | undefined {
    return this.nestConfigService.get<string>("INFLUXDB_URL");
  }

  // System
  get timezone(): string {
    return this.nestConfigService.get<string>("TZ", "UTC");
  }

  get nodeEnv(): string {
    return this.nestConfigService.get<string>("NODE_ENV", "development");
  }

  get isProduction(): boolean {
    return this.nodeEnv === "production";
  }

  // Server
  get port(): number {
    return this.nestConfigService.get<number>("PORT", 3000);
  }
}
