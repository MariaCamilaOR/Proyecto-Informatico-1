import { Spinner, Box } from "@chakra-ui/react";

interface LoaderProps {
  size?: string;
  color?: string;
}

export function Loader({ size = "lg", color = "blue.500" }: LoaderProps) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" p={8}>
      <Spinner size={size} color={color} />
    </Box>
  );
}