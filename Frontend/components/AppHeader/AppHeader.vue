<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  showBack: {
    type: Boolean,
    default: false,
  },
  showUser: {
    type: Boolean,
    default: false,
  },
  showSearch: {
    type: Boolean,
    default: false,
  },
})

const isSearching = ref(false)
const searchQuery = ref('')

watch(searchQuery, (val) => {
  console.log('Search query:', val)
})

function goBack() {
  router.back()
}
</script>

<template>
    <div class="navbar bg-base-100 shadow-sm">
      <!-- Left: back or user -->
        <div class="navbar-start">
          <button
              v-if="showBack"
              class="btn btn-ghost btn-circle"
              @click="goBack"
              aria-label="Go back"
          >
            <FontAwesomeIcon icon="arrow-left" class="text-xl" />
          </button>

          <button
            v-if="showUser"
            class="btn btn-ghost btn-circle"
            aria-label="User"
          >
            <FontAwesomeIcon icon="user" class="text-xl" />
          </button>
        </div>
  
        <!-- Center: logo -->
        <div class="navbar-center">
          <img src="" alt="Logo" class="h-6" />
        </div>
  
        <!-- Right: search -->
        <div class="navbar-end">
          <div v-if="showSearch">
            <button
              v-if="!isSearching"
              class="btn btn-ghost btn-circle"
              @click="isSearching = true"
              aria-label="Open search"
            >
              <FontAwesomeIcon icon="search" class="text-xl" />
            </button>

            <div v-else class="w-48">
              <InputField
                v-model="searchQuery"
                label=""
                note=""
                @blur="isSearching = false"
              />
            </div>
          </div>
        </div>
    </div>
  </template>