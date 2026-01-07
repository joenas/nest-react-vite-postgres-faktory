// Sequelize CLI configuration
// This file is used by sequelize-cli for migrations
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: {
      bigNumberStrings: true,
    },
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: {
      bigNumberStrings: true,
    },
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: {
      bigNumberStrings: true,
      ssl:
        process.env.DATABASE_SSL === "true"
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : false,
    },
  },
};
