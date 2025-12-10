<script setup lang="ts">
import Button from "primevue/button";
import type { VacancyDetailOut } from "src/types/models/vacancy/vacancy";
import { VacancyStatus } from "src/constants";

const emit = defineEmits<{
  (e: "change-status", value: VacancyDetailOut): void;
  (e: "selected"): void;
}>();

defineProps<{
  vacancy: VacancyDetailOut;
}>();

const buttons = [
  { status: VacancyStatus.INTERESTING, label: "interesting", severity: "success" },
  { status: VacancyStatus.NOT_INTERESTING, label: "see later", severity: "secondary" },
  { status: VacancyStatus.BANNED, label: "ban!", severity: "danger" },
  { status: VacancyStatus.APPLIED, label: "applied", severity: "success" },
] as const;

/**
 * Handles clicks on the card itself.
 * This implementation solves a common issue on mobile devices where a single tap can fire
 * both touch and click events. Simply using `@click.stop` on the buttons is often
 * unreliable for preventing the parent's click handler from firing (a "ghost click").
 *
 * Instead of trying to stop event propagation, this handler inspects the event's origin.
 * If the click originated from within a button, it is ignored. Otherwise, it emits the
 * `selected` event. This is a more robust and reliable pattern.
 * @param {MouseEvent} event The DOM click event.
 */
function onCardClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest("button")) {
    return;
  }
  emit("selected");
}
</script>

<template>
  <div
    class="rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md hover:bg-pink-100"
    @click="onCardClick"
  >
    <div class="p-6">
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-xl font-bold text-gray-800">
          {{ vacancy.title }}
          <span class="text-lg font-normal text-gray-600">
            in <strong>{{ vacancy.company }}</strong>
          </span>
        </h3>
        <span class="text-sm text-gray-500 whitespace-nowrap">{{ vacancy.date }}</span>
      </div>
      <p class="text-sm font-medium text-gray-500 mb-4">{{ vacancy.cities }}</p>
      <p class="text-gray-700 leading-relaxed">
        {{ vacancy.description }}
      </p>

      <div class="flex space-x-2 mt-4">
        <Button
          v-for="({ status, label, severity }, idx) in buttons"
          :key="label"
          size="small"
          :label="label"
          :severity="severity"
          :class="{ 'ml-auto': idx === buttons.length - 1 }"
          :disabled="vacancy.status === status"
          @click="$emit('change-status', { ...vacancy, status })"
        />
      </div>
    </div>
  </div>
</template>
