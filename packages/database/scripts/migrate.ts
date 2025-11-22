import "dotenv/config";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { client } from "@repo/database/connection";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const main = async () => {
  await migrate(drizzle(client), {
    migrationsFolder: join(__dirname, "../drizzle"),
  });
  await client.end();
  process.exit(0);
};

void main();
