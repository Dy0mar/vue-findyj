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
  semantic: {
    primary: AuraBase.primitive?.neutral,
    surface: AuraBase.primitive?.zinc,
  },
});
