import { sql } from "kysely"

import type { IntrospectedEnums } from "./index.ts"
import { KyselyTypegenDialect } from "./index.ts"

export class KyselyTypegenMySQLDialect extends KyselyTypegenDialect {
  // Keys are lowercase values returned by information_schema.COLUMNS.DATA_TYPE,
  // which is what Kysely's MysqlIntrospector forwards as column.dataType.
  public override readonly scalars: Record<string, string> = {
    bigint: "Int8",
    binary: "Buffer",
    bit: "string",
    blob: "Buffer",
    bool: "boolean",
    boolean: "boolean",
    char: "string",
    date: "Timestamp",
    datetime: "Timestamp",
    decimal: "Numeric",
    double: "number",
    enum: "string",
    float: "number",
    int: "number",
    json: "Json",
    longblob: "Buffer",
    longtext: "string",
    mediumblob: "Buffer",
    mediumint: "number",
    mediumtext: "string",
    numeric: "Numeric",
    set: "string",
    smallint: "number",
    text: "string",
    time: "string",
    timestamp: "Timestamp",
    tinyblob: "Buffer",
    tinyint: "number",
    tinytext: "string",
    varbinary: "Buffer",
    varchar: "string",
    year: "number",
  }

  protected override async introspectEnums(): Promise<IntrospectedEnums> {
    const rows = await this.database
      .withoutPlugins()
      .selectFrom("information_schema.columns as columns")
      .select([
        "columns.TABLE_NAME as tableName",
        "columns.COLUMN_NAME as columnName",
        "columns.COLUMN_TYPE as columnType",
      ])
      .where("columns.TABLE_SCHEMA", "=", sql`database()`)
      .where("columns.DATA_TYPE", "in", ["enum", "set"])
      .execute()

    const inline = new Map<string, string[]>()
    for (const row of rows) {
      const data = row as { tableName: string; columnName: string; columnType: string }
      inline.set(`${data.tableName}.${data.columnName}`, parseMysqlEnumColumnType(data.columnType))
    }
    return { named: [], inline }
  }
}

/**
 * Parses MySQL `enum(...)` / `set(...)` column type definitions into the list of declared values. MySQL doubles single quotes inside string literals.
 *
 * @example
 * parseMysqlEnumColumnType("enum('a','b','c''d')") // ["a", "b", "c'd"]
 */
const parseMysqlEnumColumnType = (columnType: string): string[] => {
  const open = columnType.indexOf("(")
  const close = columnType.lastIndexOf(")")
  if (open === -1 || close === -1 || close <= open) {
    return []
  }
  const inner = columnType.slice(open + 1, close)
  const values: string[] = []
  let current = ""
  let insideString = false
  for (let index = 0; index < inner.length; index++) {
    const character = inner[index]
    if (insideString) {
      if (character === "'" && inner[index + 1] === "'") {
        current += "'"
        index++
        continue
      }
      if (character === "'") {
        insideString = false
        values.push(current)
        current = ""
        continue
      }
      current += character
    } else if (character === "'") {
      insideString = true
    }
  }
  return values
}
