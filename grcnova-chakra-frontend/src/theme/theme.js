import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "#0f0c29", // dark purple background
        color: "whiteAlpha.900",
      },
    },
  },
  colors: {
    brand: {
      50: "#f2e7fe",
      100: "#dbb2ff",
      200: "#bb86fc",
      300: "#985eff",
      400: "#7f39fb",
      500: "#6200ee",     // Primary dark purple
      600: "#5600e8",
      700: "#3700b3",
      800: "#30009c",
      900: "#23036a",
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "bold",
        borderRadius: "xl",
      },
      variants: {
        solid: {
          bg: "brand.500",
          _hover: { bg: "brand.600" },
        },
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: "whiteAlpha.100",
            _hover: { bg: "whiteAlpha.200" },
            _focus: { bg: "whiteAlpha.200", borderColor: "brand.500" },
            color: "whiteAlpha.900",
          },
        },
      },
    },
  },
});

export default theme;