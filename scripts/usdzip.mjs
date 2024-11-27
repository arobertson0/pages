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

  const usdcFile = usdaFile.replace(".usda", ".usdc");

  // 1. Run usdcat to convert usda to usdc
  const usdaPath = path.join(usdDir, usdaFile);
  const usdaBackupPath = path.join(filesDir, usdaFile);

  console.log(`Converting ${usdaFile} to ${usdcFile}`);
  await exec(`usdcat -o ${usdcFile} ${usdaFile}`, { cwd: usdDir });
  // 2. Move original usda to parent directory
  console.log(`Moving ${usdaPath} to ${usdaFile}`);
  await fs.rename(usdaPath, usdaBackupPath);

  // 3. Zip the directory
  const zipEntries = await fs.readdir(usdDir);
  const mainFile = usdcFile;
  const secondaryFiles = zipEntries.filter((e) => e !== mainFile);

  const zipfilesList = [mainFile, ...secondaryFiles]
    .map((e) => `'${e.replaceAll("'", `'"'"'`)}'`)
    .join(" ");

  const zipname = `${ent.name}.usdz`;
  const zipPath = path.resolve(filesDir, zipname);
  await exec(`usdzip -r ${zipPath} ${zipfilesList}`, { cwd: usdDir });

  // 4. Move the usda files back to the directory
  console.log(`Moving ${usdaBackupPath} to ${usdaPath}`);
  await fs.rename(usdaBackupPath, usdaPath);
  // 5. Remove the usdc files
  console.log(`Removing ${usdcFile} in ${usdDir}`);
  await fs.unlink(path.join(usdDir, usdcFile));
}
