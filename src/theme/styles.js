import { mode } from "@chakra-ui/theme-tools";
export const globalStyles = {
  colors: {
    brand: {
      100: "#E2E4EC", // une nuance de gris clair
      200: "#58668B", // une nuance de bleu-gris
      300: "#344168", // un bleu foncé similaire à la couleur de base
      400: "#8697B5", // une nuance de bleu-gris plus claire
      500: "#1D3E5F", // la couleur de base
      600: "#0C223A", // un bleu foncé plus sombre
      700: "#01050D", // un noir très foncé pour un contraste élevé
      800: "#162E4F", // un bleu plus clair pour les éléments de marque distinctifs
      900: "#030611", // une nuance de bleu foncé très foncé pour les éléments de marque très contrastés
      },
    brandScheme: {
    100: "#B3B6D1",
    200: "#60658F",
    300: "#60658F",
    400: "#60658F",
    500: "#2C2F4D",
    600: "#191B30",
    700: "#01050D",
    800: "#0D0F1E",
    900: "#01050D",
    },
    brandTabs: {
    100: "#B3B6D1",
    200: "#2C2F4D",
    300: "#2C2F4D",
    400: "#2C2F4D",
    500: "#2C2F4D",
    600: "#191B30",
    700: "#01050D",
    800: "#0D0F1E",
    900: "#01050D",
    },
    secondaryGray: {
      100: "#E0E5F2",
      200: "#E1E9F8",
      300: "#F4F7FE",
      400: "#E9EDF7",
      500: "#8F9BBA",
      600: "#A3AED0",
      700: "#707EAE",
      800: "#707EAE",
      900: "#1B2559",
    },
    red: {
      100: "#FEEFEE",
      500: "#EE5D50",
      600: "#E31A1A",
    },
    blue: {
      50: "#EFF4FB",
      500: "#3965FF",
    },
    orange: {
      100: "#FFF6DA",
      500: "#FFB547",
    },
    green: {
      100: "#E6FAF5",
      500: "#01B574",
    },
    navy: {
      50: "#d0dcfb",
      100: "#aac0fe",
      200: "#a3b9f8",
      300: "#728fea",
      400: "#3652ba",
      500: "#1b3bbb",
      600: "#24388a",
      700: "#1B254B",
      800: "#111c44",
      900: "#0b1437",
    },
    gray: {
      100: "#FAFCFE",
    },
  },
  styles: {
    global: (props) => ({
      body: {
        overflowX: "hidden",
        bg: mode("secondaryGray.300", "navy.900")(props),
        fontFamily: "DM Sans",
        letterSpacing: "-0.5px",
      },
      input: {
        color: "gray.700",
      },
      html: {
        fontFamily: "DM Sans",
      },
    }),
  },
};
