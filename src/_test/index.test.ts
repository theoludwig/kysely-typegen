import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql"
import { PostgreSqlContainer } from "@testcontainers/postgresql"
import { Kysely, sql } from "kysely"
import { PostgresJSDialect } from "kysely-postgres-js"
import path from "node:path"
import { after, before, describe, it, snapshot } from "node:test"
import postgres from "postgres"
import { KyselyTypegenPostgresDialect } from "../index.ts"

snapshot.setResolveSnapshotPath((testFilePath) => {
  if (testFilePath == null) {
    throw new Error('"testFilePath" is null.')
  }
  const dir = path.dirname(testFilePath)
  const base = path.basename(testFilePath)
  return path.join(dir, "__snapshots__", `${base}.snapshot`)
})

const POSTGRES_IMAGE =
  "docker.io/postgres:18.4@sha256:f7ce845ee6873dd84be93c9828fe0d1fab0f9707dc9ac569694657398b290bce"

const createSchema = async (database: Kysely<any>): Promise<void> => {
  await database.schema.createType("Currency").asEnum(["EUR", "USD", "GBP"]).execute()
  await database.schema.createType("UserRole").asEnum(["admin", "member", "guest"]).execute()
  await database.schema
    .createType("OrderStatus")
    .asEnum(["pending", "paid", "shipped", "cancelled"])
    .execute()

  await database.schema
    .createTable("AllTypes")
    .addColumn("id", "uuid", (column) => {
      return column
        .notNull()
        .primaryKey()
        .defaultTo(sql`uuidv7()`)
    })
    .addColumn("colBool", "boolean", (column) => {
      return column.notNull()
    })
    .addColumn("colBoolNullable", "boolean")
    .addColumn("colBoolDefault", "boolean", (column) => {
      return column.notNull().defaultTo(false)
    })
    .addColumn("colInt2", "smallint", (column) => {
      return column.notNull()
    })
    .addColumn("colInt4", "integer", (column) => {
      return column.notNull()
    })
    .addColumn("colInt8", "bigint", (column) => {
      return column.notNull()
    })
    .addColumn("colFloat4", "real", (column) => {
      return column.notNull()
    })
    .addColumn("colFloat8", "double precision", (column) => {
      return column.notNull()
    })
    .addColumn("colNumeric", sql`numeric(12, 2)`, (column) => {
      return column.notNull()
    })
    .addColumn("colMoney", sql`money`, (column) => {
      return column.notNull()
    })
    .addColumn("colText", "text", (column) => {
      return column.notNull()
    })
    .addColumn("colVarchar", "varchar(255)", (column) => {
      return column.notNull()
    })
    .addColumn("colBpchar", sql`char(10)`, (column) => {
      return column.notNull()
    })
    .addColumn("colBytea", "bytea", (column) => {
      return column.notNull()
    })
    .addColumn("colDate", "date", (column) => {
      return column.notNull()
    })
    .addColumn("colTime", "time", (column) => {
      return column.notNull()
    })
    .addColumn("colTimetz", sql`timetz`, (column) => {
      return column.notNull()
    })
    .addColumn("colTimestamp", "timestamp", (column) => {
      return column.notNull()
    })
    .addColumn("colTimestamptz", "timestamptz", (column) => {
      return column.notNull()
    })
    .addColumn("colJson", "json", (column) => {
      return column.notNull()
    })
    .addColumn("colJsonb", "jsonb", (column) => {
      return column.notNull()
    })
    .addColumn("colUuid", "uuid", (column) => {
      return column.notNull()
    })
    .addColumn("colInet", sql`inet`, (column) => {
      return column.notNull()
    })
    .addColumn("colCidr", sql`cidr`, (column) => {
      return column.notNull()
    })
    .addColumn("colMacaddr", sql`macaddr`, (column) => {
      return column.notNull()
    })
    .addColumn("colBit", sql`bit(8)`, (column) => {
      return column.notNull()
    })
    .addColumn("colVarbit", sql`varbit(16)`, (column) => {
      return column.notNull()
    })
    .addColumn("colXml", sql`xml`, (column) => {
      return column.notNull()
    })
    .addColumn("colTsvector", sql`tsvector`, (column) => {
      return column.notNull()
    })
    .addColumn("colTsquery", sql`tsquery`, (column) => {
      return column.notNull()
    })
    .addColumn("colPoint", sql`point`, (column) => {
      return column.notNull()
    })
    .addColumn("colLine", sql`line`, (column) => {
      return column.notNull()
    })
    .addColumn("colLseg", sql`lseg`, (column) => {
      return column.notNull()
    })
    .addColumn("colBox", sql`box`, (column) => {
      return column.notNull()
    })
    .addColumn("colPath", sql`path`, (column) => {
      return column.notNull()
    })
    .addColumn("colPolygon", sql`polygon`, (column) => {
      return column.notNull()
    })
    .addColumn("colOid", sql`oid`, (column) => {
      return column.notNull()
    })
    .addColumn("colTextNullable", "text")
    .addColumn("colJsonbDefault", "jsonb", (column) => {
      return column.notNull().defaultTo(sql`'{}'::jsonb`)
    })
    .addColumn("colTimestampDefault", "timestamp", (column) => {
      return column.notNull().defaultTo(sql`now()`)
    })
    .addColumn("createdAt", "timestamptz", (column) => {
      return column.notNull().defaultTo(sql`now()`)
    })
    .addColumn("updatedAt", "timestamptz")
    .execute()

  await database.schema
    .createTable("Users")
    .addColumn("id", "uuid", (column) => {
      return column
        .notNull()
        .primaryKey()
        .defaultTo(sql`uuidv7()`)
    })
    .addColumn("username", "varchar(50)", (column) => {
      return column.notNull().unique()
    })
    .addColumn("email", "text")
    .addColumn("role", sql`"UserRole"`, (column) => {
      return column.notNull().defaultTo("member")
    })
    .addColumn("isActive", "boolean", (column) => {
      return column.notNull().defaultTo(true)
    })
    .addColumn("createdAt", "timestamptz", (column) => {
      return column.notNull().defaultTo(sql`now()`)
    })
    .execute()

  await database.schema
    .createTable("Orders")
    .addColumn("id", "bigserial", (column) => {
      return column.notNull().primaryKey()
    })
    .addColumn("userId", "uuid", (column) => {
      return column.notNull().references("Users.id")
    })
    .addColumn("status", sql`"OrderStatus"`, (column) => {
      return column.notNull().defaultTo("pending")
    })
    .addColumn("currency", sql`"Currency"`, (column) => {
      return column.notNull().defaultTo("EUR")
    })
    .addColumn("amountCents", "integer", (column) => {
      return column.notNull()
    })
    .addColumn("note", "text")
    .addColumn("createdAt", "timestamptz", (column) => {
      return column.notNull().defaultTo(sql`now()`)
    })
    .execute()
}

describe("typegen", () => {
  let container: StartedPostgreSqlContainer
  let database: Kysely<any>

  before(async () => {
    container = await new PostgreSqlContainer(POSTGRES_IMAGE).start()
    database = new Kysely<any>({
      dialect: new PostgresJSDialect({
        postgres: postgres({
          database: container.getDatabase(),
          host: container.getHost(),
          port: container.getPort(),
          user: container.getUsername(),
          password: container.getPassword(),
        }),
      }),
    })
    await createSchema(database)
  })

  after(async () => {
    await database.destroy()
    await container.stop()
  })

  it("generate types matching snapshot", async (testContext) => {
    // Arrange - Given
    const databaseTypegen = new KyselyTypegenPostgresDialect({ database })

    // Act - When
    const result = await databaseTypegen.typegen()

    // Assert - Then
    testContext.assert.snapshot({
      lines: result.lines,
      tablesCount: result.tables.length,
      enumsCount: result.enums.length,
    })
  })
})
