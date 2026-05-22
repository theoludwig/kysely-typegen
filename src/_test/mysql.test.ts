import type { StartedMySqlContainer } from "@testcontainers/mysql"
import { MySqlContainer } from "@testcontainers/mysql"
import { Kysely, MysqlDialect, sql } from "kysely"
import { createPool } from "mysql2"
import { after, before, describe, it } from "node:test"

import { KyselyTypegenMySQLDialect } from "../mysql.ts"
import "./_setup.ts"

const MYSQL_IMAGE =
  "docker.io/mysql:8.4@sha256:c36050afdca850f23cef85703f84c7531a5ae155a11b5ee1c60acb09937c4084"

const createSchema = async (database: Kysely<any>): Promise<void> => {
  await database.schema
    .createTable("AllTypes")
    .addColumn("id", "integer", (column) => {
      return column.notNull().autoIncrement().primaryKey()
    })
    .addColumn("colBigint", "bigint", (column) => {
      return column.notNull()
    })
    .addColumn("colSmallint", "smallint", (column) => {
      return column.notNull()
    })
    .addColumn("colMediumint", sql`mediumint`, (column) => {
      return column.notNull()
    })
    .addColumn("colTinyint", sql`tinyint`, (column) => {
      return column.notNull()
    })
    .addColumn("colInt", "integer", (column) => {
      return column.notNull()
    })
    .addColumn("colYear", sql`year`, (column) => {
      return column.notNull()
    })
    .addColumn("colFloat", sql`float`, (column) => {
      return column.notNull()
    })
    .addColumn("colDouble", "double precision", (column) => {
      return column.notNull()
    })
    .addColumn("colDecimal", sql`decimal(12, 2)`, (column) => {
      return column.notNull()
    })
    .addColumn("colNumeric", sql`numeric(10, 4)`, (column) => {
      return column.notNull()
    })
    .addColumn("colBool", "boolean", (column) => {
      return column.notNull()
    })
    .addColumn("colChar", sql`char(10)`, (column) => {
      return column.notNull()
    })
    .addColumn("colVarchar", "varchar(255)", (column) => {
      return column.notNull()
    })
    .addColumn("colText", "text", (column) => {
      return column.notNull()
    })
    .addColumn("colTinytext", sql`tinytext`, (column) => {
      return column.notNull()
    })
    .addColumn("colMediumtext", sql`mediumtext`, (column) => {
      return column.notNull()
    })
    .addColumn("colLongtext", sql`longtext`, (column) => {
      return column.notNull()
    })
    .addColumn("colTime", "time", (column) => {
      return column.notNull()
    })
    .addColumn("colBit", sql`bit(8)`, (column) => {
      return column.notNull()
    })
    .addColumn("colBinary", sql`binary(16)`, (column) => {
      return column.notNull()
    })
    .addColumn("colVarbinary", sql`varbinary(64)`, (column) => {
      return column.notNull()
    })
    .addColumn("colBlob", sql`blob`, (column) => {
      return column.notNull()
    })
    .addColumn("colTinyblob", sql`tinyblob`, (column) => {
      return column.notNull()
    })
    .addColumn("colMediumblob", sql`mediumblob`, (column) => {
      return column.notNull()
    })
    .addColumn("colLongblob", sql`longblob`, (column) => {
      return column.notNull()
    })
    .addColumn("colDate", "date", (column) => {
      return column.notNull()
    })
    .addColumn("colDatetime", "datetime", (column) => {
      return column.notNull()
    })
    .addColumn("colTimestamp", "timestamp", (column) => {
      return column.notNull().defaultTo(sql`current_timestamp`)
    })
    .addColumn("colJson", "json", (column) => {
      return column.notNull()
    })
    .addColumn("colTextNullable", "text")
    .addColumn("createdAt", "timestamp", (column) => {
      return column.notNull().defaultTo(sql`current_timestamp`)
    })
    .execute()

  await database.schema
    .createTable("Users")
    .addColumn("id", "integer", (column) => {
      return column.notNull().autoIncrement().primaryKey()
    })
    .addColumn("username", "varchar(50)", (column) => {
      return column.notNull().unique()
    })
    .addColumn("email", "text")
    .addColumn("role", sql`enum('admin','member','guest')`, (column) => {
      return column.notNull().defaultTo("member")
    })
    .addColumn("isActive", sql`tinyint(1)`, (column) => {
      return column.notNull().defaultTo(1)
    })
    .addColumn("createdAt", "timestamp", (column) => {
      return column.notNull().defaultTo(sql`current_timestamp`)
    })
    .execute()

  await database.schema
    .createTable("Orders")
    .addColumn("id", "bigint", (column) => {
      return column.notNull().autoIncrement().primaryKey()
    })
    .addColumn("userId", "integer", (column) => {
      return column.notNull().references("Users.id")
    })
    .addColumn("status", sql`enum('pending','paid','shipped','cancelled')`, (column) => {
      return column.notNull().defaultTo("pending")
    })
    .addColumn("currency", sql`enum('EUR','USD','GBP')`, (column) => {
      return column.notNull().defaultTo("EUR")
    })
    .addColumn("amountCents", "integer", (column) => {
      return column.notNull()
    })
    .addColumn("note", "text")
    .addColumn("createdAt", "timestamp", (column) => {
      return column.notNull().defaultTo(sql`current_timestamp`)
    })
    .execute()
}

describe("typegen MySQL", () => {
  let container: StartedMySqlContainer
  let database: Kysely<any>

  before(async () => {
    container = await new MySqlContainer(MYSQL_IMAGE).start()
    database = new Kysely<any>({
      dialect: new MysqlDialect({
        pool: createPool({
          host: container.getHost(),
          port: container.getPort(),
          user: container.getUsername(),
          password: container.getUserPassword(),
          database: container.getDatabase(),
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
    const databaseTypegen = new KyselyTypegenMySQLDialect({ database })

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
