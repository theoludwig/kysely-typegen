# kysely-typegen

[![version](https://npmx.dev/api/registry/badge/version/kysely-typegen)](https://npmx.dev/package/kysely-typegen) [![license](https://npmx.dev/api/registry/badge/license/kysely-typegen)](https://npmx.dev/package/kysely-typegen)

Generate [Kysely](https://npmx.dev/package/kysely) type definitions from your database.

Thank you [kysely-codegen](https://npmx.dev/package/kysely-codegen) for inspiration and ideas!

## Why?

Why `kysely-typegen` if there is already `kysely-codegen`? Comparison:

|                               | `kysely-codegen@0.20.0`                  | `kysely-typegen`                                             |
| ----------------------------- | ---------------------------------------- | ------------------------------------------------------------ |
| **Install Size**              | 6.8 MB                                   | 5 kB                                                         |
| **Dependencies**              | 35 total                                 | 0 (no runtime dependencies)                                  |
| **Type**                      | CLI                                      | Library/Programmatic Usage                                   |
| **Code Size/Maintainability** | Heavy                                    | Less than 200 LOC/Simple and straightforward                 |
| **Database Support**          | PostgreSQL, MySQL, SQLite, MSSQL, LibSQL | PostgreSQL (but can **easily be extended to more dialects**) |

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

Kysely dialect of your choice, for example: [kysely-postgres-js](https://github.com/kysely-org/kysely-postgres-js)

```sh
npm install kysely-postgres-js postgres
```

## Usage

### Setup Kysely database

Create your Kysely database instance (example with [kysely-postgres-js](https://github.com/kysely-org/kysely-postgres-js)):

```ts
// database.ts
import { Kysely } from "kysely"
import { PostgresJSDialect } from "kysely-postgres-js"
import postgres from "postgres"

import type { DB } from "./codegen.ts"

export const DATABASE_USER = process.env["DATABASE_USER"] ?? "user"
export const DATABASE_PASSWORD = process.env["DATABASE_PASSWORD"] ?? "password"
export const DATABASE_NAME = process.env["DATABASE_NAME"] ?? "database"
export const DATABASE_HOST = process.env["DATABASE_HOST"] ?? "localhost"
export const DATABASE_PORT = Number.parseInt(process.env["DATABASE_PORT"] ?? "5432", 10)

const dialect = new PostgresJSDialect({
  postgres: postgres({
    database: DATABASE_NAME,
    host: DATABASE_HOST,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    port: DATABASE_PORT,
  }),
})

export const database = new Kysely<DB>({ dialect })
```

### Generate the type definitions

Create a script that uses `kysely-typegen` to introspect your database and write the generated types to a file:

```ts
// scripts/typegen.ts
// This is an example, you can be more creative:
// time it takes to generate, number of tables/enums generated, etc.
import fs from "node:fs"
import path from "node:path"

import { KyselyTypegenPostgresDialect } from "kysely-typegen"

import { database } from "./database.ts"

const databaseTypegen = new KyselyTypegenPostgresDialect({ database })
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

`kysely-typegen` ships with `KyselyTypegenPostgresDialect`, but you can add support for any database by extending the abstract `KyselyTypegenDialect` class.

Only two things are required:

- `scalars`: a `Record<string, string>` mapping the database column types to TypeScript types.
- `getEnumsMap()`: a method returning a `Map<string, string[]>` of enum names to their values (return an empty `Map` if your database doesn't support enums).

```ts
import { KyselyTypegenDialect } from "kysely-typegen"
import type { Kysely } from "kysely"

export class KyselyTypegenMySQLDialect extends KyselyTypegenDialect {
  public database: KyselyTypegenDialect["database"]

  public readonly scalars: Record<string, string> = {
    bigint: "number",
    char: "string",
    datetime: "Timestamp",
    int: "number",
    json: "Json",
    text: "string",
    tinyint: "number",
    varchar: "string",
    // ...
  }

  public constructor(input: { database: Kysely<any> }) {
    super()
    this.database = input.database
  }

  protected async getEnumsMap(): Promise<Map<string, string[]>> {
    // Query your database's information schema for enum types.
    // Key: enum name, Value: array of enum values.
    return new Map()
  }
}
```

The base class handles introspection (via Kysely's `database.introspection.getTables()`), sorting, and the final type generation. Contributions of new dialects are welcome!

## Contributing

Anyone can help to improve the project, submit a Feature Request, a bug report or even correct a simple spelling mistake.

The steps to contribute can be found in the [CONTRIBUTING.md](/CONTRIBUTING.md) file.

## License

[MIT](./LICENSE)
