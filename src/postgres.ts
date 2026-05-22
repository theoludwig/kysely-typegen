import type { EnumMetadata, IntrospectedEnums } from "./index.ts"
import { KyselyTypegenDialect } from "./index.ts"

export class KyselyTypegenPostgresDialect extends KyselyTypegenDialect {
  // These types have been found through experimentation in Adminer and in the 'pg' source code.
  public override readonly scalars: Record<string, string> = {
    bit: "string",
    bool: "boolean",
    box: "string",
    bpchar: "string",
    bytea: "Buffer",
    cidr: "string",
    date: "Timestamp",
    float4: "number",
    float8: "number",
    inet: "string",
    int2: "number",
    int4: "number",
    int8: "Int8",
    json: "Json",
    jsonb: "Json",
    line: "string",
    lseg: "string",
    macaddr: "string",
    money: "string",
    numeric: "Numeric",
    oid: "number",
    path: "string",
    polygon: "string",
    text: "string",
    time: "string",
    timestamp: "Timestamp",
    timestamptz: "Timestamp",
    timetz: "string",
    tsquery: "string",
    tsvector: "string",
    uuid: "string",
    varbit: "string",
    varchar: "string",
    xml: "string",
  }

  protected override async introspectEnums(): Promise<IntrospectedEnums> {
    const rows = (await this.database
      .withoutPlugins()
      .selectFrom("pg_type as type")
      .innerJoin("pg_enum as enum", "type.oid", "enum.enumtypid")
      .select(["type.typname as name", "enum.enumlabel as value"])
      .execute()) as Array<{ name: string; value: string }>
    const grouped = new Map<string, string[]>()
    for (const { name, value } of rows) {
      const existing = grouped.get(name)
      if (existing == null) {
        grouped.set(name, [value])
      } else {
        existing.push(value)
      }
    }
    const named: EnumMetadata[] = []
    for (const [name, values] of grouped) {
      named.push({ name, values })
    }
    return { named, inline: new Map() }
  }
}
