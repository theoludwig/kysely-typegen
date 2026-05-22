import path from "node:path"
import { snapshot } from "node:test"

snapshot.setResolveSnapshotPath((testFilePath) => {
  if (testFilePath == null) {
    throw new Error('"testFilePath" is null.')
  }
  const dir = path.dirname(testFilePath)
  const base = path.basename(testFilePath)
  return path.join(dir, "__snapshots__", `${base}.snapshot`)
})
