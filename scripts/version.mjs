import fs from "node:fs/promises";
import path from "node:path";

const versionFilePath = path.resolve("src/version.json");

const versionData = await fs.readFile(versionFilePath, "utf-8");
const version = JSON.parse(versionData);

const newVersion = version + 1;
const newVersionData = JSON.stringify(newVersion);
await fs.writeFile(versionFilePath, newVersionData);
