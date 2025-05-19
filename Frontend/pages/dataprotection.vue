<script lang="ts" setup>

const {locales, setLocale} = useI18n();

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

const contentAdmin = [
  "dataProtection.generic.generalInfoTitle",
  "dataProtection.generic.generalInfoText",
  "dataProtection.admin.generalInfoText",
  "dataProtection.generic.collectedDataSubtitle",
  "dataProtection.admin.collectedDataText",
  "dataProtection.admin.collectedDataList",
  "dataProtection.generic.changesAndOverwritesSubtitle",
  "dataProtection.admin.changesAndOverwritesText",
  "dataProtection.generic.dataDeletionSubtitle",
  "dataProtection.admin.dataDeletionText",
  "dataProtection.admin.dataRetentionSubtitle",
  "dataProtection.admin.dataRetentionText.1",
  "dataProtection.admin.dataRetentionList",
  "dataProtection.admin.dataRetentionText.2",
];

// Change to string for better role handling
const selectedRole = ref('student');

// Fix the logic - we want to show admin content only when admin is selected
const isAdminSelected = computed(() => selectedRole.value === 'admin');

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

      <div class="flex flex-row gap-2 p-2 justify-center">
        <CustomSelect
          :model-value="locales.find(locale => locale.code === $i18n.locale)?.code"
          :options="locales.map(locale => ({key: locale.code, value: $t('generic.'+locale.name)}))"
          label="Select Language"
          placeholder="Select Language"
          @update:model-value="(value) => setLocale(value)"
        />

        <CustomSelect
          :model-value="selectedRole"
          :options="[
          {key: 'student', value: t('generic.student')},
          {key: 'supervisor', value: t('generic.supervisor')},
          {key: 'admin', value: t('generic.admin')}
        ]"
          label="Select Role"
          placeholder="Select Role"
          @update:model-value="(value) => selectedRole = value"
        />

      </div>


      <div
        v-for="content in (isAdminSelected ? contentAdmin : contentStudentAndSupervisor)"
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
        @click="() => deleteData()"
      />
    </div>
  </div>
</template>
