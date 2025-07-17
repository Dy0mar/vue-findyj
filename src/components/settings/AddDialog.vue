<script setup lang="ts">
import { ref } from "vue";
import PButton from "primevue/button";
import PDialog from "primevue/dialog";
import PInputText from "primevue/inputtext";

defineProps<{
  header: string;
}>();

defineEmits<{
  (e: "save", value: string): void;
  (e: "apply", value: string): void;
}>();

const name = ref<string>("");
const visible = defineModel<boolean>("visible", { required: true });
</script>

<template>
  <PDialog v-model:visible="visible" modal :header="header">
    <div class="flex items-center gap-4 mb-4">
      <label for="name" class="font-semibold w-24">Name</label>
      <PInputText v-model="name" id="name" class="flex-auto" autocomplete="off" />
    </div>
    <div class="flex justify-end gap-2">
      <PButton type="button" label="Cancel" severity="secondary" @click="visible = false" />
      <PButton type="button" label="Save" @click="$emit('save', name)" />
      <PButton type="button" label="Save and apply" @click="$emit('apply', name)" />
    </div>
  </PDialog>
</template>
