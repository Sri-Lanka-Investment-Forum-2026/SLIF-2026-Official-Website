import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const cwd = process.cwd();
const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

const resolveSqlitePath = (url: string) => {
  if (!url.startsWith("file:")) {
    throw new Error("Only SQLite file URLs are supported by scripts/db-push.ts");
  }

  const rawPath = url.slice("file:".length);
  return path.isAbsolute(rawPath) ? rawPath : path.resolve(cwd, rawPath);
};

const dbPath = resolveSqlitePath(databaseUrl);
const sqlPath = path.resolve(cwd, "prisma/init.sql");

if (!fs.existsSync(sqlPath)) {
  throw new Error(`Missing schema SQL at ${sqlPath}`);
}

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const sql = fs.readFileSync(sqlPath, "utf8").trim();
const database = new DatabaseSync(dbPath);

database.exec("PRAGMA foreign_keys = ON;");
database.exec(sql);
database.close();

console.log(`Applied schema from prisma/init.sql to ${dbPath}`);
