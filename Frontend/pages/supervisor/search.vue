<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useDebounceFn } from "@vueuse/core";
import EmptyPagePlaceholder from "~/components/Placeholder/EmptyPagePlaceholder.vue";
import SkeletonSupervisorCard from "~/components/Skeleton/SkeletonSupervisorCard.vue";
import { UserRoles } from "#shared/enums/enums";

const { t } = useI18n();

const searchQuery = ref('');
const searchResults = ref([]);
const isLoading = ref(false);

// Import the necessary API functions
const { getUserByEmail, getUserByFirstName, getUserByLastName } = useUserApi();

const debouncedSearch = useDebounceFn(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  isLoading.value = true;
  try {
    await searchStudents(searchQuery.value);
  } catch (error) {
    console.error('Error searching for supervisors:', error);
    searchResults.value = [];
  } finally {
    isLoading.value = false;
  }
}, 300);

const filterOptions = ref([
  { text: t('search.filter.name'), key: 'name', state: 'inactive' },
]);

function hasExactlyOneSpace(str) {
  return /^[^\s]+\s[^\s]+$/.test(str);
}

async function searchStudents(query) {
  let results = [];

  if (query.includes('@')) {
    results = [ await getUserByEmail(query) ].filter(Boolean);
  } else if (hasExactlyOneSpace(query)) {
    const [ first, last ] = query.trim().split(/\s+/);

    const [ firstNameUsers, lastNameUsers ] =
        await Promise.all([
          getUserByFirstName(first),
          getUserByLastName(last),
        ]);

    const found = firstNameUsers.some((fu) =>
        lastNameUsers.some((lu) => fu.id === lu.id),
    );

    results = found
        ? firstNameUsers
        : [ ...firstNameUsers, ...lastNameUsers ];
  } else {
    const [ firstNameUsers, lastNameUsers ] =
        await Promise.all([
          getUserByFirstName(query),
          getUserByLastName(query),
        ]);

    results = [ ...firstNameUsers, ...lastNameUsers ];
  }

// Filter to only show STUDENT users
  searchResults.value = results.filter(user => user.role === UserRoles.STUDENT);
}

const clearFilter = () => {
  filterOptions.value.forEach(option => {
    option.state = 'inactive';
  });
  filterOptions.value[0].state = 'ascending'; // Reset to best match

// Re-sort the results based on the new filter
  sortResults();
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

// Sort the results based on the selected filter
  sortResults();
};

const sortResults = () => {
  const activeFilter = filterOptions.value.find(option => option.state !== 'inactive');
  if (!activeFilter) return;

  const { key, state } = activeFilter;
  const direction = state === 'ascending' ? 1 : -1;

  searchResults.value = [ ...searchResults.value ].sort((a, b) => {
    if (key === 'name') {
      const nameA = `${ a.first_name } ${ a.last_name }`.toLowerCase();
      const nameB = `${ b.first_name } ${ b.last_name }`.toLowerCase();
      return direction * nameA.localeCompare(nameB);
    } else if (key === 'availability') {
// Sort by available spots (maxCapacity - currentCapacity)
      const availableA = a.max_capacity - a.current_capacity;
      const availableB = b.max_capacity - b.current_capacity;
      return direction * (availableA - availableB);
    }
// Best match - use the default order returned by the API
    return 0;
  });
};

definePageMeta({
  layout: "search-layout",
});
</script>

<template>
  <div class="flex flex-col h-full">
    <!--Search Bar-->
    <div class="flex flex-row items-center px-4 py-3 gap-3 border-b border-b-base-300 flex-shrink-0">
      <CustomButton
          color="default"
          left-icon="arrow-left"
          text=""
          variant="ghost"
          @click="navigateTo('/student/dashboard')"
      />
      <InputField
          v-model="searchQuery"
          :placeholder="t('search.placeholderForSupervisors')"
          class="w-full"
          right-icon="xmark"
          @input="debouncedSearch"
      />
    </div>

    <!--Filter-->
    <div
        class="flex flex-row items-center py-1 px-2 gap-2 overflow-x-auto border-b border-b-base-300 flex-shrink-0"
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
          :key="option.key"
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
    <div class="flex flex-col overflow-y-auto p-6 size-full gap-4 justify-start items-center">
      <SkeletonSupervisorCard
          v-if="isLoading"
      />

      <MiniCard
          v-for="result in searchResults"
          v-else-if="searchQuery.length > 0 && !isLoading && searchResults.length > 0"
          :key="result.id"
          :first-name="result.first_name"
          :image="result.profile_image"
          :last-name="result.last_name"
          :preview-text="result.thesis_description?.substring(0, 30) || ''"
          class="w-full cursor-pointer"
          @click="navigateTo(`/profiles/${result.id}`)"
      />

      <EmptyPagePlaceholder
          v-else-if="searchQuery && searchQuery.length > 0 && !isLoading"
          :text="t('search.noResults')"/>
      <EmptyPagePlaceholder
          v-else
          :text="t('search.emptyForSupervisors')"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
