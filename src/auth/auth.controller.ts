import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from "@nestjs/swagger";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { MeDto } from "./dto/me.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { Public } from "../common/decorators/public.decorator";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { ConfigService } from "../config/config.service";
import { OidcService } from "./oidc/oidc.service";

@ApiTags("auth")
@Controller("api/auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly oidcService: OidcService
  ) {}

  @Public()
  @Get("login")
  @ApiOperation({ summary: "Start OIDC login (redirect)" })
  async login(
    @Query("returnTo") returnTo: string | undefined,
    @Res() res: Response
  ) {
    // openid-client is ESM-only; load generators dynamically.
    const {
      randomState,
      randomNonce,
      randomPKCECodeVerifier,
      calculatePKCECodeChallenge,
    } = await import("openid-client");

    const state = randomState();
    const nonce = randomNonce();
    const codeVerifier = randomPKCECodeVerifier();
    const codeChallenge = await calculatePKCECodeChallenge(codeVerifier);

    const resolvedReturnTo = this.resolveReturnTo(returnTo);

    const transientCookie = {
      httpOnly: true,
      secure: this.configService.isProduction,
      sameSite: "lax" as const,
      maxAge: 10 * 60 * 1000, // 10 minutes
    };

    res.cookie("oidc_state", state, transientCookie);
    res.cookie("oidc_nonce", nonce, transientCookie);
    res.cookie("oidc_code_verifier", codeVerifier, transientCookie);
    res.cookie("oidc_return_to", resolvedReturnTo, transientCookie);

    const url = await this.oidcService.createAuthRequest({
      state,
      nonce,
      codeChallenge,
    });

    return res.redirect(url);
  }

  @Public()
  @Get("callback")
  @ApiOperation({ summary: "OIDC callback" })
  async callback(
    @Query("code") code: string | undefined,
    @Query("state") state: string | undefined,
    @Query("error") error: string | undefined,
    @Query("error_description") errorDescription: string | undefined,
    @Request() req: any,
    @Res() res: Response
  ) {
    // Handle OIDC error responses
    if (error) {
      const errorMsg = errorDescription || error;
      throw new BadRequestException(`OIDC authorization error: ${errorMsg}`);
    }

    if (!code || !state) {
      throw new BadRequestException("Missing code/state");
    }

    const expectedState = req.cookies?.oidc_state;
    const expectedNonce = req.cookies?.oidc_nonce;
    const codeVerifier = req.cookies?.oidc_code_verifier;
    const returnTo = req.cookies?.oidc_return_to;

    if (!expectedState || !expectedNonce || !codeVerifier) {
      throw new BadRequestException("Missing OIDC verifier cookies");
    }

    const claims = await this.oidcService.exchangeCode({
      code,
      state,
      expectedState,
      expectedNonce,
      codeVerifier,
    });

    const user = this.authService.getUserFromOidcClaims(claims);
    const token = this.authService.generateToken(user);

    // Persist user info in cookie, just like before.
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: this.configService.isProduction,
      sameSite: "lax",
      maxAge: this.getMaxAge(),
    });

    // Cleanup transient cookies
    res.clearCookie("oidc_state");
    res.clearCookie("oidc_nonce");
    res.clearCookie("oidc_code_verifier");
    res.clearCookie("oidc_return_to");

    return res.redirect(this.resolveReturnTo(returnTo));
  }

  @Public()
  @Post("logout")
  @ApiOperation({ summary: "Logout" })
  @ApiResponse({ status: 200, description: "Logout successful" })
  async logout(
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthResponseDto> {
    res.clearCookie("access_token");
    return { success: true, role: "" };
  }

  @Public()
  @Get("logout")
  @ApiOperation({ summary: "Logout (redirect)" })
  async logoutRedirect(@Res() res: Response) {
    res.clearCookie("access_token");
    return res.redirect(`${this.configService.frontendBaseUrl}/login`);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiCookieAuth("access_token")
  @ApiOperation({ summary: "Get current user" })
  @ApiResponse({
    status: 200,
    description: "User information",
    type: MeDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getMe(@Request() req: any): Promise<MeDto> {
    return {
      username: req.user.username,
      role: req.user.role,
    };
  }

  private getMaxAge(): number {
    const expiresIn = this.configService.jwtExpiresIn;
    // Parse expiresIn string (e.g., "7d", "24h", "3600s")
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000; // Default 7 days
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * (multipliers[unit] || multipliers.d);
  }

  private resolveReturnTo(returnTo?: string): string {
    const base = this.configService.frontendBaseUrl.replace(/\/+$/, "");
    const fallback = base;

    if (!returnTo) return fallback;
    if (typeof returnTo !== "string") return fallback;

    // Allow absolute redirects only back to the configured frontend base URL.
    if (returnTo.startsWith(base)) return returnTo;

    // Allow paths under /app (frontend basename)
    if (returnTo.startsWith("/app/") || returnTo === "/app") {
      return `${base}${returnTo === "/app" ? "" : returnTo.replace(/^\/app/, "")}`;
    }

    // Allow relative paths (assumed to be under the frontend base)
    if (returnTo.startsWith("/")) return `${base}${returnTo}`;

    return fallback;
  }
}
