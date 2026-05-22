import { KyselyTypegenDialect } from "./index.ts"

export class KyselyTypegenSQLiteDialect extends KyselyTypegenDialect {
  // SQLite is dynamically typed and pragma_table_info preserves the declared
  // type spelling verbatim. Lookups are normalized to uppercase, so keys here
  // must be uppercase. Covers the five storage classes plus popular aliases.
  public override readonly scalars: Record<string, string> = {
    BIGINT: "Int8",
    BLOB: "Buffer",
    BOOLEAN: "number",
    CHAR: "string",
    DATE: "string",
    DATETIME: "string",
    DECIMAL: "Numeric",
    DOUBLE: "number",
    FLOAT: "number",
    INTEGER: "number",
    JSON: "Json",
    NUMERIC: "Numeric",
    REAL: "number",
    TEXT: "string",
    TIMESTAMP: "string",
    VARCHAR: "string",
  }

  protected override normalizeDataType(dataType: string): string {
    const parenIndex = dataType.indexOf("(")
    const stripped = parenIndex === -1 ? dataType : dataType.slice(0, parenIndex)
    return stripped.toUpperCase()
  }
}
