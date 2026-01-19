import { getNvmDir, getNodeVersionsDir, loadNodeVersions } from "./data/nvm.js";
import { formatTable } from "./view/table.js";

async function main(): Promise<void> {
  try {
    const nvmDir = getNvmDir();
    const versionsDir = getNodeVersionsDir(nvmDir);
    const versions = await loadNodeVersions(versionsDir);

    if (versions.length === 0) {
      console.log("No Node.js versions found under:");
      console.log(`  ${versionsDir}`);
      return;
    }

    console.log(formatTable(versions));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exitCode = 1;
  }
}

void main();
