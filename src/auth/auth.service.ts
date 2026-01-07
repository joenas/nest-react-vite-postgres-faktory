import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "../config/config.service";
import { JwtPayload } from "./jwt.strategy";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Maps OIDC claims to our minimal app identity.
   * We keep the cookie contract the same as before: `access_token` is a JWT
   * containing `{ username, role }`.
   */
  getUserFromOidcClaims(claims: Record<string, any>): {
    username: string;
    role: string;
  } {
    const username =
      claims?.preferred_username ||
      claims?.email ||
      claims?.name ||
      claims?.sub ||
      "unknown";

    const email = typeof claims?.email === "string" ? claims.email : "";

    const adminEmails = this.configService.oidcAdminEmails
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    const adminUsernames = this.configService.oidcAdminUsernames
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    const isAdmin =
      adminEmails.includes(email) || adminUsernames.includes(username);

    return {
      username,
      role: isAdmin ? "admin" : "user",
    };
  }

  generateToken(payload: JwtPayload): string {
    return this.jwtService.sign(
      payload as any,
      {
        secret: this.configService.jwtSecret,
        expiresIn: this.configService.jwtExpiresIn,
      } as any
    );
  }

  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify(token, {
      secret: this.configService.jwtSecret,
    });
  }
}
