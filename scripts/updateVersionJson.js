import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pkgPath = new URL("../package.json", import.meta.url);
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

const filePath = path.resolve("public", "version.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

data.version = pkg.version;
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log(`Updated data.json with version ${pkg.version}`);
