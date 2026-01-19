import { promises as fs } from "node:fs";
import path from "node:path";

import type { NodeVersionInfo, LoadProgress } from "../models.js";
import { getFolderSizeBytesSafe } from "./fs-size.js";

const NODE_VERSIONS_DIRNAME = "versions/node";

export function getNvmDir(): string {
  const nvmDir = process.env.NVM_DIR;
  if (!nvmDir) {
    throw new Error(
      "NVM_DIR is not set. Load nvm in your shell (e.g., `source ~/.nvm/nvm.sh`)."
    );
  }
  return nvmDir;
}

export function getNodeVersionsDir(nvmDir: string): string {
  return path.join(nvmDir, NODE_VERSIONS_DIRNAME);
}

export async function loadNodeVersions(
  versionsDir: string,
  onProgress?: (progress: LoadProgress) => void
): Promise<NodeVersionInfo[]> {
  await ensureDirectoryExists(versionsDir);
  const versionNames = await listVersionNames(versionsDir);
  const sorted = versionNames.sort(compareVersionNames);
  const completed: NodeVersionInfo[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const version = sorted[i]!;
    const versionDir = path.join(versionsDir, version);

    onProgress?.({
      current: i + 1,
      total: sorted.length,
      version,
      completed: [...completed],
    });

    const [sizeBytes, globals] = await Promise.all([
      getFolderSizeBytesSafe(versionDir),
      listGlobalPackages(versionDir),
    ]);

    completed.push({ version, sizeBytes, globals });
  }

  return completed;
}

async function ensureDirectoryExists(dir: string): Promise<void> {
  try {
    const stat = await fs.stat(dir);
    if (!stat.isDirectory()) {
      throw new Error(`${dir} is not a directory.`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`NVM versions directory not found: ${dir}. ${message}`);
  }
}

async function listVersionNames(versionsDir: string): Promise<string[]> {
  const entries = await fs.readdir(versionsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
    .map((entry) => entry.name);
}

async function listGlobalPackages(versionDir: string): Promise<string[]> {
  const nodeModulesDir = path.join(versionDir, "lib", "node_modules");
  try {
    const entries = await fs.readdir(nodeModulesDir, { withFileTypes: true });
    const packages: string[] = [];

    for (const entry of entries) {
      if (!(entry.isDirectory() || entry.isSymbolicLink())) {
        continue;
      }
      if (entry.name === ".bin") {
        continue;
      }

      if (entry.name.startsWith("@")) {
        const scopedPackages = await listScopedPackages(
          path.join(nodeModulesDir, entry.name),
          entry.name
        );
        packages.push(...scopedPackages);
        continue;
      }

      packages.push(entry.name);
    }

    return packages.sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

async function listScopedPackages(
  scopeDir: string,
  scopeName: string
): Promise<string[]> {
  try {
    const entries = await fs.readdir(scopeDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
      .map((entry) => `${scopeName}/${entry.name}`);
  } catch {
    return [];
  }
}

function compareVersionNames(a: string, b: string): number {
  const parsedA = parseVersion(a);
  const parsedB = parseVersion(b);

  if (parsedA && parsedB) {
    const maxLen = Math.max(parsedA.length, parsedB.length);
    for (let i = 0; i < maxLen; i += 1) {
      const partA = parsedA[i] ?? 0;
      const partB = parsedB[i] ?? 0;
      if (partA !== partB) {
        return partA - partB;
      }
    }
    return 0;
  }

  return a.localeCompare(b);
}

function parseVersion(version: string): number[] | null {
  const cleaned = version.startsWith("v") ? version.slice(1) : version;
  if (!cleaned) {
    return null;
  }
  const parts = cleaned.split(".");
  const numbers: number[] = [];

  for (const part of parts) {
    const value = Number.parseInt(part, 10);
    if (!Number.isFinite(value)) {
      return null;
    }
    numbers.push(value);
  }

  return numbers;
}
