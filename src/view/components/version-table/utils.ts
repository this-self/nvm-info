import type { TextProps } from "ink";

import {
  PACKAGE_NAME_COLOR,
  PACKAGE_PUNCT_DIM,
  PACKAGE_VERSION_COLOR,
} from "./constants.js";

export type PackageSegment = {
  text: string;
  color?: TextProps["color"];
  dimColor?: boolean;
};
export type PackageLine = PackageSegment[];

export function formatSizeBytes(sizeBytes: number | null): string {
  if (sizeBytes === null) {
    return "N/A";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = sizeBytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const useDecimal = value < 10 && unitIndex > 0;
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: useDecimal ? 1 : 0,
    maximumFractionDigits: useDecimal ? 1 : 0,
  });

  return `${formatter.format(value)} ${units[unitIndex]}`;
}

export function wrapPackages(packages: string[], width: number): PackageLine[] {
  if (packages.length === 0) {
    return [[{ text: "-", dimColor: true }]];
  }

  const lines: PackageLine[] = [];
  let currentLine: PackageLine = [];
  let currentLength = 0;

  for (const pkg of packages) {
    const { name, version } = parsePackageLabel(pkg);
    const baseLength = name.length + (version ? 1 + version.length : 0);
    const separatorLength = currentLength > 0 ? 2 : 0;

    if (
      currentLength > 0 &&
      currentLength + separatorLength + baseLength > width
    ) {
      lines.push(currentLine);
      currentLine = [];
      currentLength = 0;
    }

    if (currentLength > 0) {
      currentLine.push({ text: ", ", dimColor: PACKAGE_PUNCT_DIM });
      currentLength += separatorLength;
    }

    currentLine.push({ text: name, color: PACKAGE_NAME_COLOR });
    if (version) {
      currentLine.push({ text: "@", dimColor: PACKAGE_PUNCT_DIM });
      currentLine.push({ text: version, color: PACKAGE_VERSION_COLOR });
    }
    currentLength += baseLength;
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

export function compareVersions(a: string, b: string): number {
  const parsedA = parseVersion(a);
  const parsedB = parseVersion(b);

  if (parsedA && parsedB) {
    const maxLen = Math.max(parsedA.length, parsedB.length);
    for (let i = 0; i < maxLen; i++) {
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

export function normalizeVersionString(version: string | null): string | null {
  if (!version) {
    return null;
  }
  const cleaned = version.startsWith("v") ? version : `v${version}`;
  return parseVersion(cleaned) ? cleaned : null;
}

function parsePackageLabel(label: string): { name: string; version: string | null } {
  const atIndex = label.lastIndexOf("@");
  if (atIndex <= 0) {
    return { name: label, version: null };
  }
  const name = label.slice(0, atIndex);
  const version = label.slice(atIndex + 1);
  return { name, version: version || null };
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
