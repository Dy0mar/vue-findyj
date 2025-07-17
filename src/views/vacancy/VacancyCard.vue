<script setup lang="ts">
import PButton from "primevue/button";
import type { VacancyDetailOut } from "src/types/models/vacancy/vacancy";
import { VacancyStatus } from "src/constants";

defineEmits<{
  (e: "change-status", value: { v_id: VacancyDetailOut["v_id"]; status: VacancyDetailOut["status"] }): void;
}>();

defineProps<{
  vacancy: VacancyDetailOut;
}>();

const buttons = [
  { status: VacancyStatus.INTERESTING, label: "interesting", severity: "success" },
  { status: VacancyStatus.NOT_INTERESTING, label: "see later", severity: "secondary" },
  { status: VacancyStatus.BANNED, label: "ban!", severity: "danger" },
];
</script>

<template>
  <div
    class="rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md hover:bg-primary-50"
  >
    <div class="p-6">
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-xl font-bold text-gray-800">
          <a :href="vacancy.link" target="_blank" rel="noopener noreferrer" class="hover:text-pink-600" @click.prevent>
            {{ vacancy.title }}
          </a>
          <span class="text-lg font-normal text-gray-600">
            in <strong>{{ vacancy.company }}</strong></span
          >
        </h3>
        <span class="text-sm text-gray-500 whitespace-nowrap">{{ vacancy.date }}</span>
      </div>
      <p class="text-sm font-medium text-gray-500 mb-4">{{ vacancy.cities }}</p>
      <p class="text-gray-700 leading-relaxed">
        {{ vacancy.description }}
      </p>

      <div class="flex justify-between mt-4">
        <div class="flex space-x-2">
          <PButton
            v-for="{ status, label, severity } in buttons"
            :key="label"
            size="small"
            :label="label"
            :severity="severity"
            @click.stop="$emit('change-status', { v_id: vacancy.v_id, status })"
          />
        </div>

        <PButton
          size="small"
          label="applied"
          severity="success"
          @click.stop="$emit('change-status', { v_id: vacancy.v_id, status: VacancyStatus.APPLIED })"
        />
      </div>
    </div>
  </div>
</template>
