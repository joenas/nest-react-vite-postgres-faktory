import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../common/decorators/public.decorator";
import { ApiKeyGuard } from "./api-key.guard";
import { ConfigService } from "../config/config.service";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  private apiKeyGuard: ApiKeyGuard;

  constructor(
    private reflector: Reflector,
    private configService: ConfigService
  ) {
    super();
    this.apiKeyGuard = new ApiKeyGuard(configService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Try API key authentication first (for static sites)
    try {
      const apiKeyResult = this.apiKeyGuard.canActivate(context);
      if (apiKeyResult) {
        return true;
      }
    } catch (error) {
      // If API key validation fails with UnauthorizedException, re-throw it
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Otherwise, continue to JWT check
    }

    // Fall back to JWT authentication (for web UI)
    try {
      const result = await super.canActivate(context);
      return result as boolean;
    } catch (error) {
      // If both fail, throw unauthorized
      throw new UnauthorizedException("Authentication required");
    }
  }
}
