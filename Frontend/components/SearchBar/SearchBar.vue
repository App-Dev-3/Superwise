<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  autoFocus: { type: Boolean, default: false },
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "" },
  rightIcon: { type: String, default: "" },
  clearable: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);
const { getUserByEmail, getUserByFirstName, getUserByLastName } = useUserApi();

const isSearching = ref(false);
const searchQuery = ref(props.modelValue || "");
const searchRef = ref(null);
const inputRef = ref(null);
const searchResults = ref([]);
let debounceTimeout = null;

const clearSearch = () => {
  searchQuery.value = "";
};

const handleClickOutside = (event) => {
  if (searchRef.value && !searchRef.value.contains(event.target)) {
    isSearching.value = false;
  }
};

const containsWhitespace = (str) => /\s/.test(str);

function hasExactlyOneSpace(str) {
  return /^[^\s]+\s[^\s]+$/.test(str);
}

const handleInput = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    emit("update:modelValue", searchQuery.value);
    getUsers(searchQuery.value);
  }, 300); // Adjust debounce time as needed
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

    console.log(found);

    if (found) {
      console.log("same");
      results = firstNameUsers;
    } else {
      console.log("different");
      results = [...firstNameUsers, ...lastNameUsers];
    }
  } else {
    const [firstNameUsers, lastNameUsers] = await Promise.all([
      getUserByFirstName(query),
      getUserByLastName(query),
    ]);
    results = [...firstNameUsers, ...lastNameUsers];
  }

  console.log("Search results:", results);
  searchResults.value = results;
}

const selectUser = (user) => {
  searchQuery.value = user.name || user.email;
  emit("update:modelValue", searchQuery.value);
  isSearching.value = false;
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  clearTimeout(debounceTimeout);
});
</script>

<template>
  <div class="input-container w-70" ref="searchRef">
    <input
      ref="inputRef"
      type="text"
      v-model="searchQuery"
      class="input input-bordered w-full rounded-full input-container__input--right"
      :placeholder="placeholder"
      @input="handleInput"
      @focus="isSearching = true"
    />
    <FontAwesomeIcon
      v-if="rightIcon"
      :icon="rightIcon"
      class="input-container__rightIcon"
      @click="clearSearch"
    />

    <!-- Dropdown results -->
    <ul v-if="isSearching && searchResults.length" class="dropdown">
      <NuxtLink
        v-for="user in searchResults"
        :key="user.id"
        class="dropdown__item"
        to="/profiles/user.id"
      >
        {{ user.first_name + " " + user.last_name || "Unknown User" }}
      </NuxtLink>
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

  &__rightIcon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    color: #888;
    cursor: pointer;
  }
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 20;
  margin-top: 0.25rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  &__item {
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  &__no-results {
    padding: 0.5rem 1rem;
    color: #888;
  }
}
</style>
