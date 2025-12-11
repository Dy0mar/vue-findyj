<script setup lang="ts">
import AppHeader from "src/layout/AppHeader.vue";
import AppFooter from "src/layout/AppFooter.vue";
import { useBus } from "src/hooks/useBus";
import { ref } from "vue";
import { EventNames } from "src/bus";
import SettingsDrawer from "src/components/settings/SettingsDrawer.vue";

const bus = useBus();
const visible = ref(false);

bus.on(EventNames.OPEN_SETTINGS, () => {
  visible.value = true;
});
</script>

<template>
  <div class="flex flex-col h-dvh bg-sky-50 font-sans overflow-hidden">
    <AppHeader />
    <main class="flex flex-1 min-h-0">
      <router-view />
      <SettingsDrawer v-model:visible="visible" />
    </main>
    <AppFooter />
  </div>
</template>
