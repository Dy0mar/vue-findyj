<script setup lang="ts">
import { ref } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";

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
  <Dialog v-model:visible="visible" modal :header="header">
    <div class="flex items-center gap-4 mb-4">
      <label for="name" class="font-semibold w-24">Name</label>
      <InputText v-model="name" id="name" class="flex-auto" autocomplete="off" />
    </div>
    <div class="flex justify-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="visible = false" />
      <Button type="button" label="Save" @click="$emit('save', name)" />
      <Button type="button" label="Save and apply" @click="$emit('apply', name)" />
    </div>
  </Dialog>
</template>
