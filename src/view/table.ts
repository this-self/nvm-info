import type { NodeVersionInfo } from "../models.js";

const HEADER_VERSION = "Version";
const HEADER_SIZE = "Size(MB)";
const HEADER_GLOBALS = "Globals";
const COLUMN_GAP = 2;
const MIN_GLOBALS_WIDTH = 10;

export function formatTable(rows: NodeVersionInfo[]): string {
  if (rows.length === 0) {
    return "No Node.js versions found.";
  }

  const versionWidth = Math.max(
    HEADER_VERSION.length,
    ...rows.map((row) => row.version.length)
  );
  const sizeWidth = Math.max(
    HEADER_SIZE.length,
    ...rows.map((row) => formatSize(row.sizeMB).length)
  );
  const terminalWidth = getTerminalWidth();
  const available = terminalWidth - (versionWidth + sizeWidth + COLUMN_GAP * 2);
  const globalsWidth = Math.max(MIN_GLOBALS_WIDTH, available);

  const lines: string[] = [];
  lines.push(
    formatHeader(versionWidth, sizeWidth, globalsWidth),
    formatDivider(versionWidth, sizeWidth, globalsWidth)
  );

  for (const row of rows) {
    const globalsLines = wrapPackages(row.globals, globalsWidth);
    globalsLines.forEach((globalsLine, index) => {
      const version = index === 0 ? row.version : "";
      const size = index === 0 ? formatSize(row.sizeMB) : "";

      lines.push(
        `${padRight(version, versionWidth)}` +
          `${" ".repeat(COLUMN_GAP)}` +
          `${padLeft(size, sizeWidth)}` +
          `${" ".repeat(COLUMN_GAP)}` +
          `${globalsLine}`
      );
    });
  }

  return lines.join("\n");
}

function formatHeader(
  versionWidth: number,
  sizeWidth: number,
  globalsWidth: number
): string {
  const globalsHeader = globalsWidth < HEADER_GLOBALS.length
    ? HEADER_GLOBALS.slice(0, globalsWidth)
    : HEADER_GLOBALS;
  return (
    `${padRight(HEADER_VERSION, versionWidth)}` +
    `${" ".repeat(COLUMN_GAP)}` +
    `${padLeft(HEADER_SIZE, sizeWidth)}` +
    `${" ".repeat(COLUMN_GAP)}` +
    `${globalsHeader}`
  );
}

function formatDivider(
  versionWidth: number,
  sizeWidth: number,
  globalsWidth: number
): string {
  return (
    `${"-".repeat(versionWidth)}` +
    `${" ".repeat(COLUMN_GAP)}` +
    `${"-".repeat(sizeWidth)}` +
    `${" ".repeat(COLUMN_GAP)}` +
    `${"-".repeat(Math.max(globalsWidth, 3))}`
  );
}

function formatSize(sizeMB: number | null): string {
  return sizeMB === null ? "NA" : String(sizeMB);
}

function wrapPackages(packages: string[], width: number): string[] {
  if (packages.length === 0) {
    return ["-"];
  }

  const lines: string[] = [];
  let current = "";

  for (const pkg of packages) {
    const next = current ? `${current}, ${pkg}` : pkg;
    if (next.length <= width || current.length === 0) {
      current = next;
    } else {
      lines.push(current);
      current = pkg;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function padRight(value: string, width: number): string {
  if (value.length >= width) {
    return value;
  }
  return value + " ".repeat(width - value.length);
}

function padLeft(value: string, width: number): string {
  if (value.length >= width) {
    return value;
  }
  return " ".repeat(width - value.length) + value;
}

function getTerminalWidth(): number {
  return process.stdout.columns ?? 120;
}
