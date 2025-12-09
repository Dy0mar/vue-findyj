import type { Preset } from "@primeuix/themes/types";
import type { AuraBaseDesignTokens } from "@primeuix/themes/aura/base";
import { definePreset } from "@primeuix/themes";
import AuraBase from "@primeuix/themes/aura";

export const FAura = definePreset(AuraBase, {
  directives: {
    tooltip: {
      max: {
        width: "auto",
      },
    },
  },
  components: {
    select: {
      colorScheme: {
        dark: {
          overlay: {
            background: "{zinc.800}",
          },
        },
      },
    },
    toast: {
      colorScheme: {
        dark: {
          success: {
            background: "{zinc.800}",
            detailColor: "{green.100}",
          },
          error: {
            background: "{zinc.800}",
            detailColor: "{red.100}",
          },
        },
      },
    },
  },
  semantic: {
    primary: AuraBase.primitive?.neutral,
  },
} satisfies Preset<AuraBaseDesignTokens>);
