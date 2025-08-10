import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "purple.800", // Dark purple background
        color: "white",    // Optional: white text
      },
    },
  },
});

export default theme;