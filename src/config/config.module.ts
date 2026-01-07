import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import { readFileSync } from "fs";
import { configValidationSchema } from "./config.schema";
import { ConfigService } from "./config.service";

/**
 * Loads configuration from environment variables, with support for Docker secrets.
 * If an environment variable ends with `_FILE`, it will read the value from that file path
 * and set the corresponding variable (without `_FILE` suffix).
 * File-based variables take precedence over direct environment variables.
 */
function loadConfigFromEnv() {
  const config: Record<string, string | number> = {};
  const fileBasedKeys = new Set<string>();

  for (const [key, value] of Object.entries(process.env)) {
    if (key.endsWith("_FILE") && value) {
      const baseKey = key.slice(0, -5);
      try {
        const fileContent = readFileSync(value, "utf-8");
        config[baseKey] = fileContent.trim();
        fileBasedKeys.add(baseKey);
      } catch (error) {
        throw new Error(
          `Failed to read secret file ${value} for ${baseKey}: ${error}`
        );
      }
    }
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (!key.endsWith("_FILE") && value !== undefined) {
      if (!fileBasedKeys.has(key)) {
        const numValue = Number(value);
        config[key] =
          !isNaN(numValue) && value.trim() !== "" ? numValue : value;
      }
    }
  }

  return config;
}

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [loadConfigFromEnv],
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
