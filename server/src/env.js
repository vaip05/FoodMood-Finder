import dotenv from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Single file: `.env` at the project root (same folder as `package.json` and `client/`). */
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", "..", ".env");

dotenv.config({ path: envPath });
