<script lang="ts" setup>
const pageContent = [
  "dataProtection.generic.generalInfoTitle",
  "dataProtection.generic.generalInfoText",
  "dataProtection.generic.collectedDataSubtitle",
  "dataProtection.student&supervisor.collectedDataText",
  "dataProtection.student&supervisor.collectedDataList",
  "dataProtection.generic.changesAndOverwritesSubtitle",
  "dataProtection.student&supervisor.changesAndOverwritesText",
  "dataProtection.generic.dataDeletionSubtitle",
  "dataProtection.student&supervisor.dataDeletionText.1",
  "dataProtection.student&supervisor.dataDeletionList",
  "dataProtection.student&supervisor.dataDeletionText.2",
];

const getStyle = (content: string) => {
  if (content.match(/Subtitle(\.\d+)?$/)) return "pt-6";
  // Removed unnecessary commented-out style conditions to reduce clutter.
};

const { t } = useI18n();

const toastData = ref({
  visible: false,
  type: "success",
  message: "",
});

const deleteData = () => {
  // Implement the logic to delete data
  console.log("Delete data button clicked");
  toastData.value = {
    visible: true,
    type: "success",
    message: t("dataProtection.generic.dataDeleted"),
  };
};

definePageMeta({
  layout: "generic-back-layout",
});
</script>

<template>
  <div class="p-8 flex flex-col gap-2">
    <div
      v-for="content in pageContent"
      :key="content"
      :class="getStyle(content)"
    >
      <ul v-if="content.match(/List(\.\d+)?$/)" class="list-disc pl-5">
        <li v-for="(item, index) in t(content).split('\n')" :key="index">
          {{ item }}
        </li>
      </ul>

      <h2 v-else-if="content.match(/Subtitle(\.\d+)?$/)" class="text-large">
        {{ t(content) }}
      </h2>

      <h1 v-else-if="content.match(/Title(\.\d+)?$/)" class="text-header">
        {{ t(content) }}
      </h1>

      <p v-else class="text-body">{{ t(content) }}</p>
    </div>
    <CustomButton
      :text="t('dataProtection.generic.deleteMyData')"
      block
      class="py-8"
      color="error"
      left-icon="trash-can"
      @click="deleteData"
    />
    <Toast
      v-if="toastData.visible"
      :duration="3000"
      :message="toastData.message"
      :type="toastData.type"
      @close="toastData.visible = false"
      @button-click="toastData.visible = false"
    />
  </div>
</template>
