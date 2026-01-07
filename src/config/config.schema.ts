import * as Joi from "joi";

export const configValidationSchema = Joi.object({
  // Database
  DATABASE_URL: Joi.string().when("DATABASE_URL_FILE", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  DATABASE_URL_FILE: Joi.string().optional(),

  // Faktory
  FAKTORY_PASSWORD: Joi.string().when("FAKTORY_PASSWORD_FILE", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  FAKTORY_PASSWORD_FILE: Joi.string().optional(),
  FAKTORY_CONCURRENCY: Joi.number().integer().default(5),

  // JWT
  JWT_SECRET: Joi.string().when("JWT_SECRET_FILE", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  JWT_SECRET_FILE: Joi.string().optional(),
  JWT_EXPIRES_IN: Joi.string().default("7d"),

  // API Keys (comma-separated list for static site authentication)
  API_KEYS: Joi.string().optional(),
  API_KEYS_FILE: Joi.string().optional(),

  // OIDC (MAS)
  OIDC_ISSUER: Joi.string().when("OIDC_ISSUER_FILE", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  OIDC_ISSUER_FILE: Joi.string().optional(),
  OIDC_CLIENT_ID: Joi.string().when("OIDC_CLIENT_ID_FILE", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  OIDC_CLIENT_ID_FILE: Joi.string().optional(),
  OIDC_CLIENT_SECRET: Joi.string().when("OIDC_CLIENT_SECRET_FILE", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  OIDC_CLIENT_SECRET_FILE: Joi.string().optional(),
  OIDC_REDIRECT_URI: Joi.string().when("OIDC_REDIRECT_URI_FILE", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  OIDC_REDIRECT_URI_FILE: Joi.string().optional(),
  OIDC_SCOPES: Joi.string().default("openid email"),
  FRONTEND_BASE_URL: Joi.string().default("http://localhost:4001/app"),
  OIDC_ADMIN_EMAILS: Joi.string().optional(),
  OIDC_ADMIN_ROLES: Joi.string().default("admin"),

  // CORS
  CORS_ALLOWED_ORIGIN: Joi.string().default("*"),

  // External services
  SENTRY_DSN: Joi.string().optional(),
  SENTRY_DSN_FILE: Joi.string().optional(),

  OPENAI_API_KEY: Joi.string().optional(),
  OPENAI_API_KEY_FILE: Joi.string().optional(),
  OPENAI_BASE_URL: Joi.string().optional(),
  OPENAI_BASE_URL_FILE: Joi.string().optional(),
  OPENAI_EMBED_MODEL: Joi.string().optional(),
  OPENAI_EMBED_MODEL_FILE: Joi.string().optional(),
  OPENAI_EMBED_MAX_TOKENS: Joi.number().integer().optional(),

  // Webhooks/URLs
  PING_URL_CRON: Joi.string().optional(),
  INFLUXDB_URL: Joi.string().optional(),
  INFLUXDB_URL_FILE: Joi.string().optional(),

  // System
  TZ: Joi.string().default("UTC"),
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),

  // Server
  PORT: Joi.number().integer().default(3000),
});
