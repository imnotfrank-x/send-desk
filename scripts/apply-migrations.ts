import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const migrationsRoot = path.join(process.cwd(), "prisma", "migrations");

async function main() {
  await prisma.$executeRawUnsafe(
    "CREATE TABLE IF NOT EXISTS _senddesk_migrations (name TEXT NOT NULL PRIMARY KEY, appliedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  );
  const applied = await prisma.$queryRawUnsafe<Array<{ name: string }>>("SELECT name FROM _senddesk_migrations");
  const appliedNames = new Set(applied.map(({ name }) => name));
  const directories = (await readdir(migrationsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const directory of directories) {
    if (appliedNames.has(directory)) continue;
    const sql = await readFile(path.join(migrationsRoot, directory, "migration.sql"), "utf8");
    const statements = sql.split(";").map((statement) => statement.trim()).filter(Boolean);
    for (const statement of statements) await prisma.$executeRawUnsafe(statement);
    await prisma.$executeRawUnsafe("INSERT INTO _senddesk_migrations (name) VALUES (?)", directory);
    console.log(`Migración aplicada: ${directory}`);
  }
  await prisma.$executeRawUnsafe("PRAGMA optimize");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

