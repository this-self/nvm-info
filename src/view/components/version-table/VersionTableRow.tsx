import { Box, Text } from "ink";

import type { NodeVersionInfo } from "../../../models.js";
import {
  COLUMN_GAP,
  MARKER_WIDTH,
  SIZE_WIDTH,
  VERSION_WIDTH,
} from "./constants.js";
import { formatSizeBytes, wrapPackages } from "./utils.js";

interface VersionTableRowProps {
  info: NodeVersionInfo;
  packagesWidth: number;
  isActive: boolean;
}

export function VersionTableRow({
  info,
  packagesWidth,
  isActive,
}: VersionTableRowProps) {
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
