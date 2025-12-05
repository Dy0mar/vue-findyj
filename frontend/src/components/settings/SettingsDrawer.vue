<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref } from "vue";
import Button from "primevue/button";
import Drawer from "primevue/drawer";
import { stopWordsTitleClient } from "src/api/client/stop-words-title";
import { stopWordsDescriptionClient } from "src/api/client/stop-words-description";
import { useRequest } from "src/hooks/useRequest";
import { EventNames, useBus } from "src/hooks/useBus";
import AddTitleStopWordDialog from "src/components/settings/AddTitleStopWordDialog.vue";
import AddDescriptionStopWordDialog from "src/components/settings/AddDescriptionStopWordDialog.vue";
import StopWordTitle from "src/components/settings/StopWordTitle.vue";
import StopWordDescription from "src/components/settings/StopWordDescription.vue";

const bus = useBus();
const route = useRoute();
const visible = defineModel<boolean>("visible", { required: true });
const isAddTitleStopWordVisible = ref(false);
const isAddDescriptionStopWordVisible = ref(false);

const isShowTitleList = ref(false);
const isShowDescriptionList = ref(false);

const afterCb = () => bus.emit(EventNames.REFETCH_VACANCIES);
const { requestAsync: applyDescriptionStopWord } = useRequest(() => {
  if (route.query.category) {
    return stopWordsDescriptionClient.apply({ data: { category: String(route.query.category) } });
  }
  return stopWordsDescriptionClient.apply();
}, afterCb);
const { requestAsync: applyTitleStopWord } = useRequest(stopWordsTitleClient.apply.bind(stopWordsTitleClient), afterCb);
</script>

<template>
  <div class="flex justify-center">
    <Drawer v-model:visible="visible" position="right">
      <template #header>
        <div class="flex items-center gap-2">
          <span class="font-bold">Settings</span>
        </div>
      </template>

      <div class="flex flex-col space-y-6">
        <div class="flex flex-col space-y-4">
          <div>Title stop words</div>
          <Button label="Add title stop word" class="flex-auto" outlined @click="isAddTitleStopWordVisible = true" />
          <Button label="Apply title stop word" class="flex-auto" outlined @click="applyTitleStopWord" />
          <Button label="Show title stop words" class="flex-auto" outlined @click="isShowTitleList = true" />
        </div>

        <div class="flex flex-col space-y-4">
          <div>Description stop words</div>
          <Button
            label="Add description stop word"
            class="flex-auto"
            outlined
            @click="isAddDescriptionStopWordVisible = true"
          />
          <Button label="Apply description stop word" class="flex-auto" outlined @click="applyDescriptionStopWord" />
          <Button
            label="Show description stop words"
            class="flex-auto"
            outlined
            @click="isShowDescriptionList = true"
          />
        </div>
      </div>
      <AddTitleStopWordDialog v-model:visible="isAddTitleStopWordVisible" />
      <AddDescriptionStopWordDialog v-model:visible="isAddDescriptionStopWordVisible" />
    </Drawer>

    <StopWordTitle v-model:visible="isShowTitleList" />
    <StopWordDescription v-model:visible="isShowDescriptionList" />
  </div>
</template>
