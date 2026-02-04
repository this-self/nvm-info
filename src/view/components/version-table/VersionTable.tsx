import { Box, Text, useInput, useApp } from "ink";
import { useMemo, useState } from "react";

import type { NodeVersionInfo } from "../../../models.js";
import {
  COLUMN_GAP,
  MARKER_WIDTH,
  SIZE_WIDTH,
  VERSION_WIDTH,
} from "./constants.js";
import { VersionTableDivider } from "./VersionTableDivider.js";
import { VersionTableHeader } from "./VersionTableHeader.js";
import { VersionTableRow } from "./VersionTableRow.js";
import { VersionTableTotalRow } from "./VersionTableTotalRow.js";
import type { SortColumn, SortDirection } from "./types.js";
import { compareVersions, normalizeVersionString } from "./utils.js";

interface VersionTableProps {
  versions: NodeVersionInfo[];
  activeVersion?: string | null;
}

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
    terminalWidth - MARKER_WIDTH - VERSION_WIDTH - SIZE_WIDTH - COLUMN_GAP * 3
  );

  return (
    <Box flexDirection="column">
      <VersionTableHeader
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        packagesWidth={packagesWidth}
      />
      <VersionTableDivider packagesWidth={packagesWidth} />
      {sortedVersions.map((info) => (
        <VersionTableRow
          key={info.version}
          info={info}
          packagesWidth={packagesWidth}
          isActive={
            normalizedActiveVersion !== null &&
            normalizeVersionString(info.version) === normalizedActiveVersion
          }
        />
      ))}
      <VersionTableTotalRow
        totalBytes={totalBytes}
        packagesWidth={packagesWidth}
      />
      <Box marginTop={1}>
        <Text dimColor>Press 1/2/3 to sort by column, q to quit</Text>
      </Box>
    </Box>
  );
}
