import dotenv from "dotenv";
import pg from "pg";

const { Pool } = pg;

// Local development uses the root-level .env file.
// On Render, environment variables are supplied directly
// by the hosting platform.
dotenv.config({
  path: "../.env",
});

const databaseUrl = process.env.DATABASE_URL;

export const databasePool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  : new Pool({
      database: "ironbark_ridge",
    });