import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

const MIN_CONCURRENCY = 4;
const MAX_CONCURRENCY = 32;

export async function getFolderSizeMB(folder: string): Promise<number | null> {
  try {
    const bytes = await getFolderSizeBytes(folder);
    const mb = Math.ceil(bytes / (1024 * 1024));
    return Number.isFinite(mb) ? mb : null;
  } catch {
    return null;
  }
}

export async function getFolderSizeBytesSafe(
  folder: string
): Promise<number | null> {
  try {
    const bytes = await getFolderSizeBytes(folder);
    return Number.isFinite(bytes) ? bytes : null;
  } catch {
    return null;
  }
}

export async function getFolderSizeBytes(
  folder: string,
  options: { concurrency?: number } = {}
): Promise<number> {
  const stat = await fs.stat(folder);
  if (!stat.isDirectory()) {
    throw new Error(`${folder} is not a directory.`);
  }

  const concurrency = normalizeConcurrency(options.concurrency);
  const queue: string[] = [folder];
  let totalBytes = 0;
  let active = 0;

  await new Promise<void>((resolve) => {
    const schedule = () => {
      while (active < concurrency && queue.length > 0) {
        const dir = queue.shift();
        if (!dir) {
          break;
        }

        active += 1;
        processDirectory(dir)
          .then(({ size, subdirs }) => {
            totalBytes += size;
            if (subdirs.length > 0) {
              queue.push(...subdirs);
            }
          })
          .catch(() => {
            // Skip unreadable directories.
          })
          .finally(() => {
            active -= 1;
            if (queue.length === 0 && active === 0) {
              resolve();
              return;
            }
            schedule();
          });
      }
    };

    schedule();
  });

  return totalBytes;
}

async function processDirectory(
  dir: string
): Promise<{ size: number; subdirs: string[] }> {
  let entries;

  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return { size: 0, subdirs: [] };
  }

  const subdirs: string[] = [];
  const fileStats = entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      subdirs.push(fullPath);
      return 0;
    }

    return getEntrySize(fullPath);
  });

  const sizes = await Promise.all(fileStats);
  const size = sizes.reduce((sum, value) => sum + value, 0);

  return { size, subdirs };
}

async function getEntrySize(pathname: string): Promise<number> {
  try {
    const stats = await fs.lstat(pathname);
    return stats.size;
  } catch {
    return 0;
  }
}

function normalizeConcurrency(requested?: number): number {
  if (requested && Number.isFinite(requested) && requested > 0) {
    return Math.floor(requested);
  }

  const cpuCount = os.cpus().length;
  const derived = cpuCount > 0 ? cpuCount * 2 : MIN_CONCURRENCY;
  return Math.min(MAX_CONCURRENCY, Math.max(MIN_CONCURRENCY, derived));
}
