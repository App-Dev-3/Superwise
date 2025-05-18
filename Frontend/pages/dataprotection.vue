<script lang="ts" setup>

const contentStudentAndSupervisor = [
  "data.protection.student.&.supervisor.general.info.title",
  "data.protection.student.&.supervisor.general.info.text",
  "data.protection.student.&.supervisor.collected.data.subtitle",
  "data.protection.student.&.supervisor.collected.data.text",
  "data.protection.student.&.supervisor.collected.data.list.1",
  "data.protection.student.&.supervisor.changes.and.overwrites.subtitle",
  "data.protection.student.&.supervisor.changes.and.overwrites.text",
  "data.protection.student.&.supervisor.data.deletion.subtitle",
  "data.protection.student.&.supervisor.data.deletion.text.1",
  "data.protection.student.&.supervisor.data.deletion.list",
  "data.protection.student.&.supervisor.data.deletion.text.2"
];

// const adminContent = computed(() => false);


const getStyle = (content: string) => {
  if (content.match(/subtitle(\.\d+)?$/))
    return "pt-6";
  // if (content.match(/title(\.\d+)?$/))
  //   return "";
  // if (content.match(/text(\.\d+)?$/))
  //   return "text-body";
  // if (content.match(/list(\.\d+)?$/))
  //   return "text-body list-disc list-inside";
};

const {t} = useI18n();

const deleteData = () => {
  // Implement the logic to delete data
  console.log("Delete data button clicked");
};
</script>

<template>
  <div>
    <AdminHeader
      :header-text="$t('data.protection.student.&.supervisor.page.header')"
    />

    <div class="px-6 py-8 flex flex-col gap-2">
      <!--      <CustomSelect-->
      <!--        :options="locales.map(locale => ({key: locale.code, value: $t('generic.'+locale.name)}))"-->
      <!--        label="Select Language"-->
      <!--        placeholder="Select Language"-->
      <!--        @update:model-value="(value) => setLocale(value)"-->
      <!--      />-->

      <div
        v-for="content in contentStudentAndSupervisor"
        :key="content"
        :class="getStyle(content)"
      >
        <!-- Use v-html for list items to render as actual HTML -->
        <ul v-if="content.match(/list(\.\d+)?$/)" class="list-disc pl-5">
          <li v-for="(item, index) in t(content).split('\n')" :key="index">
            {{ item }}
          </li>
        </ul>


        <h2 v-else-if="content.match(/subtitle(\.\d+)?$/)" class="text-large">{{ $t(content) }}</h2>

        <h1 v-else-if="content.match(/title(\.\d+)?$/)" class="text-header">{{ $t(content) }}</h1>

        <p v-else class="text-body">{{ $t(content) }}</p>
      </div>
      <CustomButton
        :text="$t('data.protection.generic.deleteMyData')"
        block
        class="py-8"
        color="error"
        left-icon="trash-can"
        @click="() => deleteData()"
      />
    </div>
  </div>
</template>
