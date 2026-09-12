import dotenv from "dotenv";
import path from "node:path";

const rootDir = path.resolve(import.meta.dirname, "../../..");

const envPath = path.join(rootDir, ".env");

dotenv.config({
  path: envPath,
  override: false,
});

export const env = process.env;

export default env;
