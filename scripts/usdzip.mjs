import child from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { cwd } from "node:process";
import { promisify } from "node:util";

const exec = promisify(child.exec);

const filesDir = "files/";

const ents = await fs.readdir(filesDir, { withFileTypes: true });

for (const ent of ents) {
  if (!ent.isDirectory()) continue;
  const usdDir = path.join(filesDir, ent.name);

  const usdFiles = await fs.readdir(usdDir);
  const usdaFile = usdFiles.find((usdFile) => usdFile.endsWith(".usda"));

  if (!usdaFile) {
    console.log(`No usda file found in ${usdDir}`);
    continue;
  }

  const mainFile = usdaFile;
  const zipname = `${ent.name}.usdz`;
  const zipPath = path.resolve(filesDir, zipname);
  await exec(`usdzip -a ${path.resolve(usdDir, mainFile)} ${zipPath}`);
}
