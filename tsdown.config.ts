import { defineConfig } from "tsdown"

export default defineConfig({
  entry: ["./src/index.ts", "./src/mysql.ts", "./src/postgres.ts", "./src/sqlite.ts"],
  dts: true,
  exports: true,
})
