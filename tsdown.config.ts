import { defineConfig } from "tsdown"

export default defineConfig({
  entry: ["./src/index.ts", "./src/mysql.ts", "./src/postgres.ts"],
  dts: true,
  exports: true,
})
