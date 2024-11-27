import child from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import {} from "node:zlib";

const filesDir = "files/";
const filesPath = path.resolve(filesDir);

const ents = await fs.readdir(filesPath, { withFileTypes: true });

for (const ent of ents) {
  if (!ent.isDirectory()) continue;
  const dirPath = path.resolve(filesPath, ent.name);
  const zipname = `${ent.name}.usdz`;
  const zipPath = path.resolve(filesPath, zipname);
  await child.exec(`zip -r ${zipPath} ${dirPath}`);
}
