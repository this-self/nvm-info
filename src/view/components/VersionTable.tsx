import { Box, Text, useInput, useApp, type TextProps } from "ink";
import { useState, useMemo } from "react";

import type { NodeVersionInfo } from "../../models.js";

type SortColumn = "version" | "size" | "packages";
type SortDirection = "asc" | "desc";

interface VersionTableProps {
  versions: NodeVersionInfo[];
  activeVersion?: string | null;
}

const VERSION_WIDTH = 12;
const SIZE_WIDTH = 10;
const MARKER_WIDTH = 2;
const COLUMN_GAP = 2;
const PACKAGE_NAME_COLOR: TextProps["color"] = "yellow";
const PACKAGE_VERSION_COLOR: TextProps["color"] = "cyan";
const PACKAGE_PUNCT_DIM = true;

export function VersionTable({ versions, activeVersion }: VersionTableProps) {
  const { exit } = useApp();
  const [sortColumn, setSortColumn] = useState<SortColumn>("version");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const normalizedActiveVersion = useMemo(
    () => normalizeVersionString(activeVersion ?? null),
    [activeVersion]
  );

  useInput((input, key) => {
    if (input === "q" || (key.ctrl && input === "c")) {
      exit();
      return;
    }

    if (input === "1") {
      handleSort("version");
    } else if (input === "2") {
      handleSort("size");
    } else if (input === "3") {
      handleSort("packages");
    }
  });

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedVersions = useMemo(() => {
    const sorted = [...versions];
    sorted.sort((a, b) => {
      let result: number;
      switch (sortColumn) {
        case "version":
          result = compareVersions(a.version, b.version);
          break;
        case "size":
          result = (a.sizeBytes ?? 0) - (b.sizeBytes ?? 0);
          break;
        case "packages":
          result = a.globals.length - b.globals.length;
          break;
      }
      return sortDirection === "asc" ? result : -result;
    });
    return sorted;
  }, [versions, sortColumn, sortDirection]);

  const totalBytes = useMemo(() => {
    let total = 0;
    let hasValue = false;
    for (const info of versions) {
      if (typeof info.sizeBytes === "number") {
        total += info.sizeBytes;
        hasValue = true;
      }
    }
    return hasValue ? total : null;
  }, [versions]);

  const terminalWidth = process.stdout.columns ?? 80;
  const packagesWidth = Math.max(
    20,
    terminalWidth -
      MARKER_WIDTH -
      VERSION_WIDTH -
      SIZE_WIDTH -
      COLUMN_GAP * 3
  );

  return (
    <Box flexDirection="column">
      <Header
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        packagesWidth={packagesWidth}
      />
      <Divider packagesWidth={packagesWidth} />
      {sortedVersions.map((info) => (
        <VersionRow
          key={info.version}
          info={info}
          packagesWidth={packagesWidth}
          isActive={
            normalizedActiveVersion !== null &&
            normalizeVersionString(info.version) === normalizedActiveVersion
          }
        />
      ))}
      <TotalRow totalBytes={totalBytes} packagesWidth={packagesWidth} />
      <Box marginTop={1}>
        <Text dimColor>Press 1/2/3 to sort by column, q to quit</Text>
      </Box>
    </Box>
  );
}

interface HeaderProps {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  packagesWidth: number;
}

function Header({ sortColumn, sortDirection, packagesWidth }: HeaderProps) {
  const arrow = sortDirection === "asc" ? "▲" : "▼";

  const versionHeader = `Version${sortColumn === "version" ? ` ${arrow}` : ""}`;
  const sizeHeader = `${sortColumn === "size" ? `${arrow} ` : ""}Size`;
  const packagesHeader = `Packages${sortColumn === "packages" ? ` ${arrow}` : ""}`;

  return (
    <Box>
      <Box width={MARKER_WIDTH}>
        <Text> </Text>
      </Box>
      <Box width={COLUMN_GAP} />
      <Box width={VERSION_WIDTH}>
        {sortColumn === "version" ? (
          <Text bold underline color="cyan">
            {versionHeader}
          </Text>
        ) : (
          <Text bold>{versionHeader}</Text>
        )}
      </Box>
      <Box width={COLUMN_GAP} />
      <Box width={SIZE_WIDTH} justifyContent="flex-end">
        {sortColumn === "size" ? (
          <Text bold underline color="cyan">
            {sizeHeader}
          </Text>
        ) : (
          <Text bold>{sizeHeader}</Text>
        )}
      </Box>
      <Box width={COLUMN_GAP} />
      <Box width={packagesWidth}>
        {sortColumn === "packages" ? (
          <Text bold underline color="cyan">
            {packagesHeader}
          </Text>
        ) : (
          <Text bold>{packagesHeader}</Text>
        )}
      </Box>
    </Box>
  );
}

interface DividerProps {
  packagesWidth: number;
}

function Divider({ packagesWidth }: DividerProps) {
  return (
    <Box>
      <Text>{"-".repeat(MARKER_WIDTH)}</Text>
      <Box width={COLUMN_GAP} />
      <Text>{"-".repeat(VERSION_WIDTH)}</Text>
      <Box width={COLUMN_GAP} />
      <Text>{"-".repeat(SIZE_WIDTH)}</Text>
      <Box width={COLUMN_GAP} />
      <Text>{"-".repeat(packagesWidth)}</Text>
    </Box>
  );
}

interface VersionRowProps {
  info: NodeVersionInfo;
  packagesWidth: number;
  isActive: boolean;
}

function VersionRow({ info, packagesWidth, isActive }: VersionRowProps) {
  const wrappedPackages = wrapPackages(info.globals, packagesWidth);

  return (
    <>
      {wrappedPackages.map((line, index) => (
        <Box key={`${info.version}-${index}`}>
          <Box width={MARKER_WIDTH}>
            {index === 0 && isActive ? (
              <Text color="cyan">▶</Text>
            ) : (
              <Text> </Text>
            )}
          </Box>
          <Box width={COLUMN_GAP} />
          <Box width={VERSION_WIDTH}>
            {index === 0 ? (
              <Text color={isActive ? "cyan" : "green"} bold={isActive}>
                {info.version}
              </Text>
            ) : (
              <Text> </Text>
            )}
          </Box>
          <Box width={COLUMN_GAP} />
          <Box width={SIZE_WIDTH} justifyContent="flex-end">
            {index === 0 ? (
              <Text>{formatSizeBytes(info.sizeBytes)}</Text>
            ) : (
              <Text> </Text>
            )}
          </Box>
          <Box width={COLUMN_GAP} />
          <Box width={packagesWidth}>
            <Text>
              {line.map((segment, segmentIndex) => (
                <Text
                  key={`${segment.text}-${segmentIndex}`}
                  color={segment.color}
                  dimColor={segment.dimColor}
                >
                  {segment.text}
                </Text>
              ))}
            </Text>
          </Box>
        </Box>
      ))}
    </>
  );
}

interface TotalRowProps {
  totalBytes: number | null;
  packagesWidth: number;
}

function TotalRow({ totalBytes, packagesWidth }: TotalRowProps) {
  return (
    <Box marginTop={1}>
      <Box width={MARKER_WIDTH}>
        <Text> </Text>
      </Box>
      <Box width={COLUMN_GAP} />
      <Box width={VERSION_WIDTH}>
        <Text bold>Total</Text>
      </Box>
      <Box width={COLUMN_GAP} />
      <Box width={SIZE_WIDTH} justifyContent="flex-end">
        <Text>{formatSizeBytes(totalBytes)}</Text>
      </Box>
      <Box width={COLUMN_GAP} />
      <Box width={packagesWidth}>
        <Text> </Text>
      </Box>
    </Box>
  );
}

function formatSizeBytes(sizeBytes: number | null): string {
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

type PackageSegment = {
  text: string;
  color?: TextProps["color"];
  dimColor?: boolean;
};
type PackageLine = PackageSegment[];

function parsePackageLabel(label: string): { name: string; version: string | null } {
  const atIndex = label.lastIndexOf("@");
  if (atIndex <= 0) {
    return { name: label, version: null };
  }
  const name = label.slice(0, atIndex);
  const version = label.slice(atIndex + 1);
  return { name, version: version || null };
}

function wrapPackages(packages: string[], width: number): PackageLine[] {
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

function compareVersions(a: string, b: string): number {
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

function normalizeVersionString(version: string | null): string | null {
  if (!version) {
    return null;
  }
  const cleaned = version.startsWith("v") ? version : `v${version}`;
  return parseVersion(cleaned) ? cleaned : null;
}
