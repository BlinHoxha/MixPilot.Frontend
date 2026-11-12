import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const snapshot = path.join(root, "packages/api-client/openapi.json");
const backend = process.env.MIXPILOT_OPENAPI;
if (backend) {
  const source = await fs.readFile(path.resolve(backend), "utf8");
  if (process.argv.includes("--check")) {
    if (
      JSON.stringify(JSON.parse(source)) !==
      JSON.stringify(JSON.parse(await fs.readFile(snapshot, "utf8")))
    )
      throw Error(
        "Backend OpenAPI differs from the checked-in snapshot. Regenerate contracts.",
      );
  } else await fs.writeFile(snapshot, source);
}
const output = astToString(
  await openapiTS(JSON.parse(await fs.readFile(snapshot, "utf8"))),
);
const destination = path.join(root, "packages/api-client/src/generated.ts");
if (process.argv.includes("--check")) {
  if ((await fs.readFile(destination, "utf8")) !== output)
    throw Error("Generated contracts are stale. Run pnpm contracts:generate.");
  console.log("OpenAPI contracts match.");
} else {
  await fs.writeFile(destination, output);
  console.log("Generated API contracts.");
}
