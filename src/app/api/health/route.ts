import { connection } from "next/server";
import { healthResponse } from "../../../lib/health.ts";
export async function GET() {
  // SQLite access alone is not detected as dynamic by Cache Components.
  // Never prerender a database readiness result into the production build.
  await connection();
  return healthResponse();
}
