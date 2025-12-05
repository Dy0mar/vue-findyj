<script setup lang="ts" generic="T extends { id: number; word: string }">
import { useConfirm } from "primevue/useconfirm";
import Drawer from "primevue/drawer";
import Button from "primevue/button";
import ConfirmDialog from "primevue/confirmdialog";

defineProps<{
  header: string;
  items: T[];
}>();

const emit = defineEmits<{
  (e: "remove", value: T): void;
}>();

const confirm = useConfirm();

const confirmDelete = (item: T) => {
  confirm.require({
    header: "Delete",
    message: `Are u sure u want to delete "${item.word}"`,
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Delete",
      severity: "danger",
    },
    accept: () => {
      emit("remove", item);
    },
  });
};

const visible = defineModel<boolean>("visible", { required: true });
</script>

<template>
  <Drawer v-model:visible="visible" :header position="right">
    <ul class="list-none">
      <li v-for="item in items" :key="item.id" class="flex justify-between space-y-4">
        <span>{{ item.word }}</span>
        <Button
          icon="pi pi-times"
          severity="danger"
          rounded
          variant="outlined"
          aria-label="ConfirmDelete"
          size="small"
          @click="confirmDelete(item)"
        />
      </li>
    </ul>
    <ConfirmDialog />
  </Drawer>
</template>
