import { Box, Text } from "ink";

import {
  COLUMN_GAP,
  MARKER_WIDTH,
  SIZE_WIDTH,
  VERSION_WIDTH,
} from "./constants.js";

interface VersionTableDividerProps {
  packagesWidth: number;
}

export function VersionTableDivider({
  packagesWidth,
}: VersionTableDividerProps) {
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
