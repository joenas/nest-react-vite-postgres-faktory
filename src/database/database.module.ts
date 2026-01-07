import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigModule } from "../config/config.module";
import { ConfigService } from "../config/config.service";
import { DatabaseService } from "./database.service";

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: "postgres",
        uri: configService.databaseUrl,
        autoLoadModels: true,
        synchronize: false, // Use migrations instead
        logging: configService.nodeEnv === "development" ? console.log : false,
      }),
    }),
  ],
  providers: [DatabaseService],
  exports: [SequelizeModule, DatabaseService],
})
export class DatabaseModule {}
