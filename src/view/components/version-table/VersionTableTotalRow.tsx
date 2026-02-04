import { Box, Text } from "ink";

import {
  COLUMN_GAP,
  MARKER_WIDTH,
  SIZE_WIDTH,
  VERSION_WIDTH,
} from "./constants.js";
import { formatSizeBytes } from "./utils.js";

interface VersionTableTotalRowProps {
  totalBytes: number | null;
  packagesWidth: number;
}

export function VersionTableTotalRow({
  totalBytes,
  packagesWidth,
}: VersionTableTotalRowProps) {
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
