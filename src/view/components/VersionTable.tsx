import { Box, Text, useInput, useApp } from "ink";
import { useState, useMemo } from "react";

import type { NodeVersionInfo } from "../../models.js";

type SortColumn = "version" | "size" | "packages";
type SortDirection = "asc" | "desc";

interface VersionTableProps {
  versions: NodeVersionInfo[];
}

const VERSION_WIDTH = 12;
const SIZE_WIDTH = 12;
const COLUMN_GAP = 2;

export function VersionTable({ versions }: VersionTableProps) {
  const { exit } = useApp();
  const [sortColumn, setSortColumn] = useState<SortColumn>("version");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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
          result = (a.sizeMB ?? 0) - (b.sizeMB ?? 0);
          break;
        case "packages":
          result = a.globals.length - b.globals.length;
          break;
      }
      return sortDirection === "asc" ? result : -result;
    });
    return sorted;
  }, [versions, sortColumn, sortDirection]);

  const terminalWidth = process.stdout.columns ?? 80;
  const packagesWidth = Math.max(
    20,
    terminalWidth - VERSION_WIDTH - SIZE_WIDTH - COLUMN_GAP * 2
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
        />
      ))}
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
  const sizeHeader = `${sortColumn === "size" ? `${arrow} ` : ""}Size(MB)`;
  const packagesHeader = `Packages${sortColumn === "packages" ? ` ${arrow}` : ""}`;

  return (
    <Box>
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
}

function VersionRow({ info, packagesWidth }: VersionRowProps) {
  const wrappedPackages = wrapPackages(info.globals, packagesWidth);

  return (
    <>
      {wrappedPackages.map((line, index) => (
        <Box key={`${info.version}-${index}`}>
          <Box width={VERSION_WIDTH}>
            {index === 0 ? (
              <Text color="green">{info.version}</Text>
            ) : (
              <Text> </Text>
            )}
          </Box>
          <Box width={COLUMN_GAP} />
          <Box width={SIZE_WIDTH} justifyContent="flex-end">
            {index === 0 ? (
              <Text>{formatSize(info.sizeMB)}</Text>
            ) : (
              <Text> </Text>
            )}
          </Box>
          <Box width={COLUMN_GAP} />
          <Box width={packagesWidth}>
            <Text>{line}</Text>
          </Box>
        </Box>
      ))}
    </>
  );
}

function formatSize(sizeMB: number | null): string {
  return sizeMB === null ? "N/A" : String(sizeMB);
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
