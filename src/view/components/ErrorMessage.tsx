import { Box, Text } from "ink";

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <Box flexDirection="column">
      <Text color="red" bold>
        Error:
      </Text>
      <Text color="red">{message}</Text>
    </Box>
  );
}
