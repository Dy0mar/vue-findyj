<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref } from "vue";
import PButton from "primevue/button";
import PDrawer from "primevue/drawer";
import { vacancyClient } from "src/api/client/vacancy";
import { useRequest } from "src/hooks/useRequest";
import { EventNames, useBus } from "src/hooks/useBus";
import AddTitleStopWordDialog from "src/components/settings/AddTitleStopWordDialog.vue";
import AddDescriptionStopWordDialog from "src/components/settings/AddDescriptionStopWordDialog.vue";

const bus = useBus();
const route = useRoute();
const visible = defineModel<boolean>("visible", { required: true });
const isAddTitleStopWordVisible = ref(false);
const isAddDescriptionStopWordVisible = ref(false);

const afterCb = () => bus.emit(EventNames.REFETCH_VACANCIES);
const { requestAsync: applyDescriptionStopWord } = useRequest(() => {
  if (route.query.category) {
    return vacancyClient.applyDescriptionStopWord({ data: { category: String(route.query.category) } });
  }
  return vacancyClient.applyDescriptionStopWord();
}, afterCb);
const { requestAsync: applyTitleStopWord } = useRequest(vacancyClient.applyTitleStopWord.bind(vacancyClient), afterCb);
</script>

<template>
  <div class="card flex justify-center">
    <PDrawer v-model:visible="visible" position="right">
      <template #header>
        <div class="flex items-center gap-2">
          <span class="font-bold">Settings</span>
        </div>
      </template>

      <div class="flex flex-col space-y-6">
        <div class="flex flex-col space-y-4">
          <div>Title stop words</div>
          <PButton label="Add title stop word" class="flex-auto" outlined @click="isAddTitleStopWordVisible = true" />
          <PButton label="Apply title stop word" class="flex-auto" outlined @click="applyTitleStopWord" />
        </div>

        <div class="flex flex-col space-y-4">
          <div>Description stop words</div>
          <PButton
            label="Add description stop word"
            class="flex-auto"
            outlined
            @click="isAddDescriptionStopWordVisible = true"
          />
          <PButton label="Apply description stop word" class="flex-auto" outlined @click="applyDescriptionStopWord" />
        </div>
      </div>
      <AddTitleStopWordDialog v-model:visible="isAddTitleStopWordVisible" />
      <AddDescriptionStopWordDialog v-model:visible="isAddDescriptionStopWordVisible" />
    </PDrawer>
  </div>
</template>
