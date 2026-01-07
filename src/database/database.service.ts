import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { InjectConnection } from "@nestjs/sequelize";
import { Sequelize } from "sequelize";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@InjectConnection() private readonly sequelize: Sequelize) {}

  async onModuleInit() {
    try {
      await this.sequelize.authenticate();
      this.logger.log("Database connection established successfully.");
    } catch (error) {
      this.logger.error("Unable to connect to the database:", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.sequelize.close();
      this.logger.log("Database connection closed successfully.");
    } catch (error) {
      this.logger.error("Error closing database connection:", error);
    }
  }
}
