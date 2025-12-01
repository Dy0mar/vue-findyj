<script setup lang="ts">
import Button from "primevue/button";
import type { VacancyDetailOut } from "src/types/models/vacancy/vacancy";
import { VacancyStatus } from "src/constants";

defineEmits<{
  (e: "change-status", value: VacancyDetailOut): void;
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
</script>

<template>
  <div
    class="rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md hover:bg-pink-100"
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
          @click.stop="$emit('change-status', { ...vacancy, status })"
        />
      </div>
    </div>
  </div>
</template>
