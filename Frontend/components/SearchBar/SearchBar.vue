<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  modelValue: { type: String, default: "" },
  rightIcon: { type: String, default: "" },
  placeholder: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);
const { getUserByEmail, getUserByFirstName, getUserByLastName } = useUserApi();

const searchQuery = ref(props.modelValue || "");
const searchRef = ref(null);
const inputRef = ref(null);
const isSearching = ref(false);
const isExpanded = ref(false);
const searchResults = ref([]);
let debounceTimeout = null;

const handleClickOutside = (event) => {
  if (searchRef.value && !searchRef.value.contains(event.target)) {
    isSearching.value = false;
    isExpanded.value = false;
  }
};

const expandSearch = () => {
  isExpanded.value = true;
  isSearching.value = true;
  nextTick(() => {
    inputRef.value?.focus();
  });
};

const clearSearch = () => {
  searchQuery.value = "";
};

function hasExactlyOneSpace(str) {
  return /^[^\s]+\s[^\s]+$/.test(str);
}

const handleInput = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    emit("update:modelValue", searchQuery.value);
    getUsers(searchQuery.value);
  }, 300);
};

async function getUsers(query) {
  let results = [];

  if (query.includes("@")) {
    results = [await getUserByEmail(query)];
  } else if (hasExactlyOneSpace(query)) {
    const [first, last] = query.trim().split(/\s+/);

    const [firstNameUsers, lastNameUsers] = await Promise.all([
      getUserByFirstName(first),
      getUserByLastName(last),
    ]);

    const found = firstNameUsers.some((fu) =>
      lastNameUsers.some((lu) => fu.id === lu.id)
    );

    results = found ? firstNameUsers : [...firstNameUsers, ...lastNameUsers];
  } else {
    const [firstNameUsers, lastNameUsers] = await Promise.all([
      getUserByFirstName(query),
      getUserByLastName(query),
    ]);
    results = [...firstNameUsers, ...lastNameUsers];
  }

  searchResults.value = results;
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  clearTimeout(debounceTimeout);
});
</script>

<template>
  <div ref="searchRef" class="input-container w-70">
    <div
      class="search-wrapper"
      :class="{ expanded: isExpanded }"
      @click="!isExpanded && expandSearch()"
    >
      <FontAwesomeIcon
        icon="fa-solid fa-magnifying-glass"
        class="search-icon"
      />
      <input
        ref="inputRef"
        v-model="searchQuery"
        :placeholder="placeholder"
        class="search-input"
        type="text"
        @input="handleInput"
        @focus="isSearching = true"
      >
      <FontAwesomeIcon
        v-if="rightIcon && isSearching"
        :icon="rightIcon"
        class="clear-icon"
        @click="clearSearch"
      />
    </div>

    <ul v-if="isSearching && searchResults.length" class="dropdown bg-base-100">
      <li v-for="user in searchResults" :key="user.id" class="dropdown__item">
        <NuxtLink :to="`/profiles/${user.id}`">
          {{ user.first_name + " " + user.last_name || "Unknown User" }}
        </NuxtLink>
      </li>
    </ul>

    <div
      v-if="isSearching && searchQuery && searchResults.length === 0"
      class="dropdown dropdown__no-results"
    >
      <p>No results found</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-container {
  position: relative;
  height: 2.5rem;
}

.search-wrapper {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  display: flex;
  align-items: center;

  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #ccc;
  border-radius: 9999px;
  overflow: hidden;
  cursor: pointer;

  transition: width 0.4s ease;

  &.expanded {
    width: 15rem;
  }

  .search-icon {
    font-size: 1.2rem;
    margin-left: 0.5rem;
  }

  .search-input {
    flex: 1;
    margin-left: 0.5rem;
    border: none;
    outline: none;

    opacity: 0;
    transition: opacity 0.3s ease 0.2s;
  }

  &.expanded .search-input {
    opacity: 1;
  }

  .clear-icon {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;

    opacity: 0;
    transition: opacity 0.2s ease 0.4s;
  }

  &.expanded .clear-icon {
    opacity: 1;
  }
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 20;
  margin-top: 0.25rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  &__item {
    padding: 0.5rem 1rem;
    cursor: pointer;

    &:hover {
      background-color: oklch(0.54 0.245 262.881);
    }
  }

  &__no-results {
    padding: 0.5rem 1rem;
    color: #888;
  }
}
</style>
