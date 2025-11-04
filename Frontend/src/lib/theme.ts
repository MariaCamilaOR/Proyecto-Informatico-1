import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    blue: {
      50: "#e3f2fd",
      100: "#bbdefb",
      200: "#90caf9",
      300: "#64b5f6",
      400: "#42a5f5",
      500: "#1976d2",
      600: "#1565c0",
      700: "#0d47a1",
      800: "#0d47a1",
      900: "#0d47a1",
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 600,
        borderRadius: "8px",
        minHeight: "44px",
        transition: "all 0.2s ease",
      },
      variants: {
        solid: {
          bg: "blue.500",
          color: "white",
          _hover: {
            bg: "blue.600",
            transform: "translateY(-2px)",
            boxShadow: "0 4px 16px rgba(25, 118, 210, 0.2)",
          },
          _active: {
            bg: "blue.700",
            transform: "translateY(0)",
          },
          _focus: {
            boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.2)",
          },
        },
        outline: {
          borderColor: "blue.500",
          color: "blue.600",
          _hover: {
            bg: "blue.50",
            borderColor: "blue.600",
            color: "blue.700",
          },
          _active: {
            bg: "blue.100",
            borderColor: "blue.700",
          },
        },
        ghost: {
          color: "blue.600",
          _hover: {
            bg: "blue.50",
            color: "blue.700",
          },
          _active: {
            bg: "blue.100",
          },
        },
      },
      defaultProps: {
        colorScheme: "blue",
        variant: "solid",
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: "white",
          border: "2px solid",
          borderColor: "blue.50",
        },
      },
    },
    Heading: {
      baseStyle: {
        color: "blue.700",
      },
    },
    Text: {
      baseStyle: {
        color: "blue.600",
      },
    },
    Input: {
      baseStyle: {
        field: {
          bg: "white",
          borderColor: "blue.200",
          color: "blue.700",
          _focus: {
            borderColor: "blue.500",
            boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.2)",
          },
        },
      },
    },
    Badge: {
      baseStyle: {
        bg: "blue.50",
        color: "blue.700",
        borderColor: "blue.300",
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: "white",
        color: "blue.600",
      },
      "*": {
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          bg: "blue.50",
        },
        "&::-webkit-scrollbar-thumb": {
          bg: "blue.300",
          borderRadius: "4px",
          "&:hover": {
            bg: "blue.400",
          },
        },
      },
    },
  },
});

export default theme;

