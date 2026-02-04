import { Box, Text } from "ink";

import {
  COLUMN_GAP,
  MARKER_WIDTH,
  SIZE_WIDTH,
  VERSION_WIDTH,
} from "./constants.js";
import type { SortColumn, SortDirection } from "./types.js";

interface VersionTableHeaderProps {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  packagesWidth: number;
}

export function VersionTableHeader({
  sortColumn,
  sortDirection,
  packagesWidth,
}: VersionTableHeaderProps) {
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
