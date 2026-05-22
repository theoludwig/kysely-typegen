# kysely-typegen

[![version](https://npmx.dev/api/registry/badge/version/kysely-typegen)](https://npmx.dev/package/kysely-typegen) [![license](https://npmx.dev/api/registry/badge/license/kysely-typegen)](https://npmx.dev/package/kysely-typegen)

Generate [Kysely](https://npmx.dev/package/kysely) type definitions from your database.

Thank you [kysely-codegen](https://npmx.dev/package/kysely-codegen) for inspiration and ideas!

## Why?

Why `kysely-typegen` if there is already `kysely-codegen`? Comparison:

|                               | `kysely-codegen@0.20.0`                  | `kysely-typegen`                                                                    |
| ----------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------- |
| **Install Size**              | 6.8 MB                                   | 22.1 kB                                                                             |
| **Dependencies**              | 35 total                                 | 0 (no runtime dependencies)                                                         |
| **Type**                      | CLI                                      | Library/Programmatic Usage                                                          |
| **Code Size/Maintainability** | Heavy                                    | Lightweight/Simple and straightforward (string manipulation instead of complex AST) |
| **Database Support**          | PostgreSQL, MySQL, SQLite, MSSQL, LibSQL | PostgreSQL, MySQL, SQLite (**can be easily extended to more**)                      |

`kysely-typegen` is a **library** (not a CLI), which means you are in control of where and how to run it, and is designed to be **extensible**, easy to add support for more database dialects.

For example: you can use [Node.js with the `--env-file` CLI option](https://nodejs.org/api/environment_variables.html), `dotenv` dependency is not required (but can be used), **you are in control**.

**Note:** `kysely-typegen` doesn't have the same features and customization as `kysely-codegen`, it has less features to keep it simple and lightweight, but can be extended to your own needs. For more details, why this project was created, and the design decisions, see: <https://github.com/RobinBlomberg/kysely-codegen/issues/175>.

## Prerequisites

[Node.js](https://nodejs.org/) >= 24.0.0

## Installation

```sh
npm install --save-dev kysely-typegen
```

Peer dependencies:

```sh
npm install kysely
```

Plus a Kysely dialect driver for your database (see [Setup Kysely database](#setup-kysely-database) below).

## Usage

### Setup Kysely database

Create your Kysely database instance and export a `databaseTypegen` for the script in the next section. The rest of the guide is dialect-agnostic: only this file changes per database.

#### PostgreSQL

`KyselyTypegenPostgresDialect` works with any Kysely PostgreSQL dialect, including the built-in [`PostgresDialect`](https://kysely.dev/docs/dialects/postgres) (using [`pg`](https://npmx.dev/package/pg)) and [`PostgresJSDialect`](https://npmx.dev/package/kysely-postgres-js) (using [`postgres`](https://npmx.dev/package/postgres)). The example below uses `kysely-postgres-js`.

```sh
npm install kysely-postgres-js postgres
```

```ts
// database.ts
import { Kysely } from "kysely"
import { PostgresJSDialect } from "kysely-postgres-js"
import { KyselyTypegenPostgresDialect } from "kysely-typegen/postgres"
import postgres from "postgres"

import type { DB } from "./codegen.ts"

const dialect = new PostgresJSDialect({
  postgres: postgres({
    database: process.env["DATABASE_NAME"] ?? "database",
    host: process.env["DATABASE_HOST"] ?? "localhost",
    user: process.env["DATABASE_USER"] ?? "user",
    password: process.env["DATABASE_PASSWORD"] ?? "password",
    port: Number.parseInt(process.env["DATABASE_PORT"] ?? "5432", 10),
  }),
})

export const database = new Kysely<DB>({ dialect })
export const databaseTypegen = new KyselyTypegenPostgresDialect({ database })
```

#### MySQL

```sh
npm install mysql2
```

```ts
// database.ts
import { Kysely, MysqlDialect } from "kysely"
import { KyselyTypegenMySQLDialect } from "kysely-typegen/mysql"
import { createPool } from "mysql2"

import type { DB } from "./codegen.ts"

const dialect = new MysqlDialect({
  pool: createPool({
    database: process.env["DATABASE_NAME"] ?? "database",
    host: process.env["DATABASE_HOST"] ?? "localhost",
    user: process.env["DATABASE_USER"] ?? "user",
    password: process.env["DATABASE_PASSWORD"] ?? "password",
    port: Number.parseInt(process.env["DATABASE_PORT"] ?? "3306", 10),
  }),
})

export const database = new Kysely<DB>({ dialect })
export const databaseTypegen = new KyselyTypegenMySQLDialect({ database })
```

#### SQLite

```sh
npm install better-sqlite3
```

```ts
// database.ts
import Database from "better-sqlite3"
import { Kysely, SqliteDialect } from "kysely"
import { KyselyTypegenSQLiteDialect } from "kysely-typegen/sqlite"

import type { DB } from "./codegen.ts"

const dialect = new SqliteDialect({
  database: new Database(process.env["DATABASE_PATH"] ?? "database.sqlite"),
})

export const database = new Kysely<DB>({ dialect })
export const databaseTypegen = new KyselyTypegenSQLiteDialect({ database })
```

### Generate the type definitions

Create a script that uses `databaseTypegen` to introspect your database and write the generated types to a file. This script is the same regardless of the underlying database:

```ts
// scripts/typegen.ts
// This is an example, you can be more creative:
// time it takes to generate, number of tables/enums generated, etc.
import fs from "node:fs"
import path from "node:path"

import { database, databaseTypegen } from "./database.ts"

const result = await databaseTypegen.typegen()
const codegenContent = result.lines.join("\n")
const codegenPath = path.join(process.cwd(), "codegen.ts")
await fs.promises.writeFile(codegenPath, codegenContent, "utf-8")
await database.destroy()
```

Run with Node.js (using `--env-file` to load environment variables, no `dotenv` dependency required):

```sh
node --env-file=.env scripts/typegen.ts
```

### Using the type definitions

Import `DB` into `new Kysely<DB>`, and you're done!

```ts
import { database } from "./database.ts"

const rows = await database.selectFrom("User").selectAll().execute()
//    ^ { createdAt: Date; email: string; id: number; ... }[]
```

Fully type-safe queries derived from your actual database schema.

## Extending to other database dialects

`kysely-typegen` ships with `KyselyTypegenPostgresDialect`, `KyselyTypegenMySQLDialect`, and `KyselyTypegenSQLiteDialect`, but you can add support for any database by extending the abstract `KyselyTypegenDialect` class.

Only one thing is required:

- `scalars`: a `Record<string, string>` mapping the database column types to TypeScript types.

```ts
import { KyselyTypegenDialect } from "kysely-typegen"

export class KyselyTypegenMSSQLDialect extends KyselyTypegenDialect {
  public override readonly scalars: Record<string, string> = {
    bigint: "Int8",
    bit: "boolean",
    char: "string",
    datetime: "Timestamp",
    decimal: "Numeric",
    int: "number",
    nvarchar: "string",
    smallint: "number",
    text: "string",
    varbinary: "Buffer",
    varchar: "string",
    // ...
  }
}
```

If your database supports enums, override the optional `introspectEnums()` hook, which returns two maps:

- `named`: enum name → values (emitted as `export type Name = "a" | "b"`).
- `inline`: `${tableName}.${columnName}` → values (emitted inline at the column site, for databases like MySQL where enums are anonymous per-column).

```ts
import type { IntrospectedEnums } from "kysely-typegen"

protected override async introspectEnums(): Promise<IntrospectedEnums> {
  // Query your database's information schema...
  return { named: [], inline: new Map() }
}
```

If your database needs to normalize column type spellings before scalar lookup (e.g. strip `VARCHAR(255)` → `VARCHAR`, or uppercase keys), override the optional `normalizeDataType(dataType: string): string` hook.

The base class handles introspection (via Kysely's `database.introspection.getTables()`), sorting, and the final type generation. Contributions of new dialects are welcome!

## Contributing

Anyone can help to improve the project, submit a Feature Request, a bug report or even correct a simple spelling mistake.

The steps to contribute can be found in the [CONTRIBUTING.md](/CONTRIBUTING.md) file.

## License

[MIT](./LICENSE)
