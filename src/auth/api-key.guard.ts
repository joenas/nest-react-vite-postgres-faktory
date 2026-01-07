import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "../config/config.service";

@Injectable()
export class ApiKeyGuard {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      return false;
    }

    const validKeys = this.configService.apiKeys;
    if (validKeys.length === 0) {
      return false;
    }

    if (!validKeys.includes(apiKey)) {
      throw new UnauthorizedException("Invalid API key");
    }

    // Set a minimal user object for API key authentication
    request.user = {
      username: "api-client",
      role: "user",
      apiKey: true,
    };

    return true;
  }

  private extractApiKey(request: any): string | null {
    // Check Authorization header: "Bearer <api-key>" or "ApiKey <api-key>"
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const parts = authHeader.split(" ");
      if (parts.length === 2) {
        const scheme = parts[0].toLowerCase();
        const token = parts[1];
        if (scheme === "bearer" || scheme === "apikey") {
          return token;
        }
      }
    }

    // Check X-API-Key header
    const apiKeyHeader = request.headers["x-api-key"];
    if (apiKeyHeader) {
      return apiKeyHeader;
    }

    return null;
  }
}
