import { readdir, readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Prisma } from "@prisma/client";

const schemaPath = fileURLToPath(
  new URL("../../../prisma/schema.prisma", import.meta.url),
);
const migrationsPath = fileURLToPath(
  new URL("../../../prisma/migrations", import.meta.url),
);

function parseEnums(schema) {
  return [...schema.matchAll(/^enum\s+(\w+)\s*\{([^}]*)\}/gm)].map(
    ([, name, body]) => ({
      name,
      values: body
        .split(/\r?\n/)
        .map((line) => line.replace(/\/\/.*$/, "").trim())
        .filter((line) => line && !line.startsWith("@@"))
        .map((line) => line.split(/\s+/)[0]),
    }),
  );
}

async function getLocalMigrations() {
  const entries = await readdir(migrationsPath, { withFileTypes: true });
  const migrations = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const migrationSqlPath = new URL(
      `../../../prisma/migrations/${entry.name}/migration.sql`,
      import.meta.url,
    );
    try {
      if ((await stat(migrationSqlPath)).isFile()) migrations.push(entry.name);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  return migrations.sort();
}

export async function inspectSchemaReadiness(prisma) {
  const [migrationRows, databaseColumns, databaseEnums, schema, localMigrations] =
    await Promise.all([
      prisma.$queryRaw`
        SELECT migration_name, finished_at, rolled_back_at
        FROM public."_prisma_migrations"
        ORDER BY started_at
      `,
      prisma.$queryRaw`
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = current_schema()
      `,
      prisma.$queryRaw`
        SELECT t.typname AS enum_name, e.enumlabel AS enum_value
        FROM pg_type t
        JOIN pg_enum e ON e.enumtypid = t.oid
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = current_schema()
        ORDER BY t.typname, e.enumsortorder
      `,
      readFile(schemaPath, "utf8"),
      getLocalMigrations(),
    ]);

  const columnsByTable = new Map();
  for (const { table_name, column_name } of databaseColumns) {
    if (!columnsByTable.has(table_name)) columnsByTable.set(table_name, new Set());
    columnsByTable.get(table_name).add(column_name);
  }

  const missingColumns = [];
  for (const model of Prisma.dmmf.datamodel.models) {
    const tableName = model.dbName || model.name;
    const columns = columnsByTable.get(tableName);
    for (const field of model.fields) {
      if (
        field.kind !== "object" &&
        (!columns || !columns.has(field.dbName || field.name))
      ) {
        missingColumns.push(`${tableName}.${field.dbName || field.name}`);
      }
    }
  }

  const enumValuesByName = new Map();
  for (const { enum_name, enum_value } of databaseEnums) {
    if (!enumValuesByName.has(enum_name)) enumValuesByName.set(enum_name, []);
    enumValuesByName.get(enum_name).push(enum_value);
  }

  const enumMismatches = parseEnums(schema)
    .filter(({ name, values }) => {
      const actualValues = enumValuesByName.get(name);
      return (
        !actualValues ||
        values.length !== actualValues.length ||
        values.some((value, index) => value !== actualValues[index])
      );
    })
    .map(({ name }) => name);

  const localMigrationSet = new Set(localMigrations);
  const appliedMigrations = migrationRows
    .filter((row) => row.finished_at && !row.rolled_back_at)
    .map((row) => row.migration_name);
  const appliedMigrationSet = new Set(appliedMigrations);
  const failedMigrations = migrationRows
    .filter((row) => !row.finished_at && !row.rolled_back_at)
    .map((row) => row.migration_name);
  const pendingMigrations = localMigrations.filter(
    (name) => !appliedMigrationSet.has(name) && !failedMigrations.includes(name),
  );
  const unknownAppliedMigrations = appliedMigrations.filter(
    (name) => !localMigrationSet.has(name),
  );

  const ready =
    missingColumns.length === 0 &&
    enumMismatches.length === 0 &&
    failedMigrations.length === 0 &&
    pendingMigrations.length === 0 &&
    unknownAppliedMigrations.length === 0;

  return {
    ready,
    database: "connected",
    schema: { missingColumns, enumMismatches },
    migrations: {
      pending: pendingMigrations,
      failed: failedMigrations,
      appliedButMissingLocally: unknownAppliedMigrations,
    },
  };
}
