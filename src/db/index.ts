import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("database url missing");
}

// WebSocket pool (not neon-http) so db.transaction() is supported.
// Node 22+ provides a global WebSocket, so no `ws` polyfill is needed.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

export default db;
