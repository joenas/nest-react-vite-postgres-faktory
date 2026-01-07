import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "../../config/config.service";

type OidcConfiguration = any;

@Injectable()
export class OidcService {
  private readonly logger = new Logger(OidcService.name);
  private configPromise?: Promise<OidcConfiguration>;

  constructor(private readonly configService: ConfigService) {}

  private async getConfig(): Promise<OidcConfiguration> {
    if (!this.configPromise) {
      this.configPromise = this.createConfig();
    }
    return this.configPromise;
  }

  private async createConfig(): Promise<OidcConfiguration> {
    // openid-client is ESM-only; use dynamic import to stay compatible with CJS output.
    const { discovery, ClientSecretPost } = await import("openid-client");

    const issuerUrl = this.configService.oidcIssuerUrl;
    const clientId = this.configService.oidcClientId;
    const redirectUrl = this.configService.oidcRedirectUrl;

    this.logger.debug(`Discovering OIDC issuer metadata from ${issuerUrl}`);

    try {
      const config = await discovery(
        new URL(issuerUrl),
        clientId,
        {
          redirect_uris: [redirectUrl],
          response_types: ["code"],
        },
        ClientSecretPost(this.configService.oidcClientSecret)
      );

      this.logger.debug("OIDC discovery successful");

      return config;
    } catch (error: any) {
      this.logger.error(`OIDC discovery failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createAuthRequest(params: {
    state: string;
    nonce: string;
    codeChallenge: string;
  }): Promise<string> {
    const { buildAuthorizationUrl } = await import("openid-client");
    const config = await this.getConfig();

    const authParams = {
      redirect_uri: this.configService.oidcRedirectUrl,
      scope: this.configService.oidcScopes,
      state: params.state,
      nonce: params.nonce,
      code_challenge: params.codeChallenge,
      code_challenge_method: "S256" as const,
    };

    return buildAuthorizationUrl(config, authParams).toString();
  }

  async exchangeCode(params: {
    code: string;
    state: string;
    expectedState: string;
    expectedNonce: string;
    codeVerifier: string;
  }): Promise<Record<string, any>> {
    const { authorizationCodeGrant } = await import("openid-client");
    const config = await this.getConfig();

    const currentUrl = new URL(this.configService.oidcRedirectUrl);
    currentUrl.searchParams.set("code", params.code);
    currentUrl.searchParams.set("state", params.state);

    const tokens = await authorizationCodeGrant(config, currentUrl, {
      expectedState: params.expectedState,
      expectedNonce: params.expectedNonce,
      pkceCodeVerifier: params.codeVerifier,
    });

    return (tokens.claims() ?? {}) as Record<string, any>;
  }
}
