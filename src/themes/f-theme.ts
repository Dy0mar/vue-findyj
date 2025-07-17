import type { PrimeVueConfiguration } from "primevue";
import { FAura } from "src/themes/f-preset";

export const FTheme = {
  ripple: true,
  theme: {
    preset: FAura,
    options: {
      darkModeSelector: ".dark",
      prefix: "p",
      fontFamily: "Inter, sans-serif",
      cssLayer: {
        name: "primevue",
        order: "theme, base, primevue",
      },
    },
  },
} satisfies PrimeVueConfiguration;
