import child from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(child.exec);

const filesDir = "files/";
const filesPath = filesDir;

const ents = await fs.readdir(filesPath, { withFileTypes: true });

for (const ent of ents) {
  if (!ent.isDirectory()) continue;
  const dirPath = path.resolve(filesPath, ent.name);

  const usdFiles = await fs.readdir(dirPath);
  // Rewrite above code to use filter
  const usdaFiles = usdFiles.filter((usdFile) => usdFile.endsWith(".usda"));

  for (const usdaFile of usdaFiles) {
    // 1. Run usdcat to convert usda to usdc
    const usdaPath = path.resolve(dirPath, usdaFile);
    const usdcPath = usdaPath.replace(".usda", ".usdc");
    const usdaBackupPath = path.resolve(filesPath, usdaFile);
    console.log(`Converting ${usdaPath} to ${usdcPath}`);
    await exec(`usdcat -o ${usdcPath} ${usdaPath}`);
    // 2. Move original usda to parent directory
    console.log(`Moving ${usdaPath} to ${usdaFile}`);
    await fs.rename(usdaPath, usdaBackupPath);
  }

  // 3. Zip the directory
  const zipEntries = await fs.readdir(dirPath);
  const zipname = `${ent.name}.usdz`;
  const zipPath = path.resolve(filesPath, zipname);
  await exec(
    `usdzip -r ${zipPath} ${zipEntries
      .map((e) => `'${e.replaceAll("'", `'"'"'`)}'`)
      .join(" ")}`,
    { cwd: dirPath }
  );

  for (const usdaFile of usdaFiles) {
    const usdaPath = path.resolve(dirPath, usdaFile);
    const usdcPath = usdaPath.replace(".usda", ".usdc");
    const usdaBackupPath = path.resolve(filesPath, usdaFile);
    // 4. Move the usda files back to the directory
    console.log(`Moving ${usdaBackupPath} to ${usdaPath}`);
    await fs.rename(usdaBackupPath, usdaPath);
    // 5. Remove the usdc files
    console.log(`Removing ${usdcPath}`);
    await fs.unlink(usdcPath);
  }
}
