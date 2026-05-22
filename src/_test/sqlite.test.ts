import Database from "better-sqlite3"
import { Kysely, sql, SqliteDialect } from "kysely"
import { after, before, describe, it } from "node:test"

import { KyselyTypegenSQLiteDialect } from "../sqlite.ts"
import "./_setup.ts"

const createSchema = async (database: Kysely<any>): Promise<void> => {
  await database.schema
    .createTable("AllTypes")
    .addColumn("id", "integer", (column) => {
      return column.notNull().primaryKey()
    })
    .addColumn("colInteger", "integer", (column) => {
      return column.notNull()
    })
    .addColumn("colReal", "real", (column) => {
      return column.notNull()
    })
    .addColumn("colText", "text", (column) => {
      return column.notNull()
    })
    .addColumn("colBlob", "blob", (column) => {
      return column.notNull()
    })
    .addColumn("colNumeric", sql`NUMERIC`, (column) => {
      return column.notNull()
    })
    .addColumn("colBoolean", sql`BOOLEAN`, (column) => {
      return column.notNull().defaultTo(0)
    })
    .addColumn("colDatetime", sql`DATETIME`, (column) => {
      return column.notNull()
    })
    .addColumn("colVarchar", sql`VARCHAR(255)`, (column) => {
      return column.notNull()
    })
    .addColumn("colJson", sql`JSON`, (column) => {
      return column.notNull()
    })
    .addColumn("colTextNullable", "text")
    .execute()

  await database.schema
    .createTable("Users")
    .addColumn("id", "integer", (column) => {
      return column.notNull().primaryKey()
    })
    .addColumn("username", sql`VARCHAR(50)`, (column) => {
      return column.notNull().unique()
    })
    .addColumn("email", "text")
    .addColumn("isActive", sql`BOOLEAN`, (column) => {
      return column.notNull().defaultTo(1)
    })
    .addColumn("createdAt", sql`DATETIME`, (column) => {
      return column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    })
    .execute()

  await database.schema
    .createTable("Orders")
    .addColumn("id", "integer", (column) => {
      return column.notNull().primaryKey()
    })
    .addColumn("userId", "integer", (column) => {
      return column.notNull().references("Users.id")
    })
    .addColumn("amountCents", "integer", (column) => {
      return column.notNull()
    })
    .addColumn("note", "text")
    .addColumn("createdAt", sql`DATETIME`, (column) => {
      return column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    })
    .execute()
}

describe("typegen SQLite", () => {
  let database: Kysely<any>

  before(async () => {
    database = new Kysely<any>({
      dialect: new SqliteDialect({
        database: new Database(":memory:"),
      }),
    })
    await createSchema(database)
  })

  after(async () => {
    await database.destroy()
  })

  it("generate types matching snapshot", async (testContext) => {
    // Arrange - Given
    const databaseTypegen = new KyselyTypegenSQLiteDialect({ database })

    // Act - When
    const result = await databaseTypegen.typegen()

    // Assert - Then
    testContext.assert.snapshot({
      lines: result.lines,
      tablesCount: result.tables.length,
      enumsCount: result.enums.length,
      inlineEnumsCount: result.inlineEnums.size,
    })
  })
})
