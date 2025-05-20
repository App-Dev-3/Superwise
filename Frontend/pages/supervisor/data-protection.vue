<script lang="ts" setup>

const contentStudentAndSupervisor = [
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
  if (content.match(/Subtitle(\.\d+)?$/))
    return "pt-6";
  // if (content.match(/Title(\.\d+)?$/))
  //   return "";
  // if (content.match(/text(\.\d+)?$/))
  //   return "text-body";
  // if (content.match(/List(\.\d+)?$/))
  //   return "text-body list-disc list-inside";
};

const {t} = useI18n();

const deleteData = () => {
  // Implement the logic to delete data
  console.log("Delete data button clicked");
};
</script>

<template>
  <div class="h-screen flex flex-col">
    <AdminHeader
      :header-text="$t('dataProtection.generic.pageHeader')"
    />

    <div class="px-6 py-8 flex flex-col gap-2 h-full overflow-y-auto">
      <div
        v-for="content in contentStudentAndSupervisor"
        :key="content"
        :class="getStyle(content)"
      >
        <ul v-if="content.match(/List(\.\d+)?$/)" class="list-disc pl-5">
          <li v-for="(item, index) in t(content).split('\n')" :key="index">
            {{ item }}
          </li>
        </ul>


        <h2 v-else-if="content.match(/Subtitle(\.\d+)?$/)" class="text-large">{{ $t(content) }}</h2>

        <h1 v-else-if="content.match(/Title(\.\d+)?$/)" class="text-header">{{ $t(content) }}</h1>

        <p v-else class="text-body">{{ $t(content) }}</p>
      </div>
      <CustomButton
        :text="$t('dataProtection.generic.deleteMyData')"
        block
        class="py-8"
        color="error"
        left-icon="trash-can"
        @click="deleteData"
      />
    </div>
  </div>
</template>
