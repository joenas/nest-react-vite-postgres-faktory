import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule } from "../config/config.module";
import { ConfigService } from "../config/config.service";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { OidcService } from "./oidc/oidc.service";

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ({
          secret: configService.jwtSecret,
          signOptions: {
            expiresIn: configService.jwtExpiresIn,
          },
        }) as any,
    }),
  ],
  providers: [AuthService, JwtStrategy, OidcService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
