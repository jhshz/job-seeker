import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineGlobalStyles,
  defineSemanticTokens,
  defineTokens,
} from "@chakra-ui/react";

// Brand green palette based on logo color #0BDC85
const brandColors = defineTokens.colors({
  brand: {
    50: { value: "#e8fdf5" },
    100: { value: "#c2fae8" },
    200: { value: "#8ef5d3" },
    300: { value: "#5aefbd" },
    400: { value: "#0BDC85" },
    500: { value: "#0ab872" },
    600: { value: "#08945d" },
    700: { value: "#067048" },
    800: { value: "#054c33" },
    900: { value: "#03281c" },
    950: { value: "#021810" },
  },
});

const brandSemantic = defineSemanticTokens.colors({
  brand: {
    contrast: {
      value: { _light: "white", _dark: "white" },
    },
    fg: {
      value: { _light: "{colors.brand.700}", _dark: "{colors.brand.300}" },
    },
    subtle: {
      value: { _light: "{colors.brand.100}", _dark: "{colors.brand.900}" },
    },
    muted: {
      value: { _light: "{colors.brand.200}", _dark: "{colors.brand.800}" },
    },
    emphasized: {
      value: { _light: "{colors.brand.300}", _dark: "{colors.brand.700}" },
    },
    solid: {
      value: { _light: "{colors.brand.600}", _dark: "{colors.brand.500}" },
    },
    focusRing: {
      value: { _light: "{colors.brand.500}", _dark: "{colors.brand.500}" },
    },
    border: {
      value: { _light: "{colors.brand.500}", _dark: "{colors.brand.400}" },
    },
  },
});

const greenThemeConfig = defineConfig({
  theme: {
    tokens: {
      colors: brandColors,
    },
    semanticTokens: {
      colors: brandSemantic,
    },
  },
  globalCss: defineGlobalStyles({
    html: {
      color: "fg",
      bg: "bg",
      lineHeight: "1.5",
      colorPalette: "brand",
    },
  }),
});

export const system = createSystem(defaultConfig, greenThemeConfig);
