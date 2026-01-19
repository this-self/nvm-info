import { Box, Text } from "ink";
import { useState, useEffect } from "react";

import type { LoadProgress } from "../../models.js";

interface LoadingProgressProps {
  progress: LoadProgress | null;
}

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export function LoadingProgress({ progress }: LoadingProgressProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % SPINNER_FRAMES.length);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  const spinner = SPINNER_FRAMES[frameIndex];

  if (!progress) {
    return (
      <Box>
        <Text color="cyan">{spinner}</Text>
        <Text> Discovering Node versions...</Text>
      </Box>
    );
  }

  const { current, total, version } = progress;
  const progressBar = createProgressBar(current, total, 20);

  return (
    <Box flexDirection="column">
      <Box>
        <Text color="cyan">{spinner}</Text>
        <Text> Processing </Text>
        <Text color="green">{version}</Text>
        <Text>
          {" "}
          ({current}/{total})
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text color="cyan">{progressBar}</Text>
      </Box>
    </Box>
  );
}

function createProgressBar(
  current: number,
  total: number,
  width: number
): string {
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}]`;
}
