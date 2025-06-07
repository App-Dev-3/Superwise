<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useDebounceFn } from "@vueuse/core";
import EmptyPagePlaceholder from "~/components/Placeholder/EmptyPagePlaceholder.vue";

const { t } = useI18n();

const searchQuery = ref('');

const debouncedSearch = useDebounceFn(() => {
  // Implement search logic here, e.g., call an API or filter a list
  console.log('Searching for:', searchQuery.value);
}, 300);

const filterOptions = ref([
  { text: t('search.filter.bestMatch'), key: 'best-match', state: 'ascending' },
  { text: t('search.filter.name'), key: 'name', state: 'inactive' },
  { text: t('search.filter.availability'), key: 'availability', state: 'inactive' },
]);


const clearFilter = () => {
  filterOptions.value.forEach(option => {
    option.state = 'inactive';
  });
  filterOptions.value[0].state = 'ascending'; // Reset to best match
};

const filterBy = (key) => {
  filterOptions.value.forEach(option => {
    // Option 1: Not the correct key -> set to inactive
    if (option.key !== key) {
      option.state = 'inactive';
    }
    // Option 2: The correct key -> set to ascending
    else if (option.state === 'inactive' || option.state === 'descending') {
      option.state = 'ascending';
    }
    // Option 3: The correct key is already ascending -> toggle to descending
    else if (option.state === 'ascending') {
      option.state = 'descending';
    }
  });
};

definePageMeta({
  layout: "generic-back-layout",
});
</script>

<template>

  <div class="size-full">
    <!--Search Bar-->
    <div class="w-full h-fit flex flex-row items-center px-4 py-3 gap-3 border-b border-b-base-300">
      <CustomButton
          color="default"
          left-icon="arrow-left"
          text=""
          variant="ghost"
          @click="navigateTo('/student/dashboard')"
      />
      <InputField
          v-model="searchQuery"
          :placeholder="t('search.placeholder')"
          class="w-full"
          right-icon="xmark"
          @input="debouncedSearch"
      />
    </div>

    <!--Filter-->
    <div
        class="w-full h-fit flex flex-row items-center py-1 px-2 gap-2 overflow-y-auto border-b border-b-base-300"
    >
      <CustomButton
          :left-icon="filterOptions[0].state !== 'ascending' ? 'filter-circle-xmark': 'filter'"
          color="default"
          text=""
          variant="ghost"
          @click="clearFilter"
      />

      <CustomTag
          v-for="option in filterOptions"
          :key="option.value"
          :color="option.state === 'inactive' ? 'default' : 'primary'"
          :left-icon="{ inactive: 'up-down', ascending: 'caret-up', descending: 'caret-down' }[option.state]"
          :text="option.text"
          :variant="option.state === 'inactive' ? 'outline' : 'soft'"
          clickable
          size="md"
          @click="filterBy(option.key)"
      />
    </div>

    <!--Search Results-->
    <div class="size-full overflow-y-auto px-6 py-8 gap-4">
      Results
    </div>
    <div
        v-if="!searchQuery || searchQuery.length === 0"
        class="flex size-full justify-center items-center"
    >
      <EmptyPagePlaceholder
          :text="t('search.empty')"
      />
    </div>
  </div>

</template>

<style scoped>

</style>