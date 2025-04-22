<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'

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
  modelValue: {
    type: String,
    default: '',
  },
})

const isSearching = ref(false)

const emit = defineEmits(['update:modelValue'])

function handleInput(value) {
  emit('update:modelValue', value)
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="w-full">
    <div class="navbar bg-base-100 shadow z-10">
      <div class="navbar-start ps-3">
        <button
          v-if="showBack"
          class="btn btn-ghost btn-circle"
          @click="goBack"
          data-test="back-button"
        >
          <FontAwesomeIcon icon="arrow-left" class="text-xl" />
          <span class="text-sm font-medium opacity-50	">Back</span>
        </button>

        <button
          v-if="showUser"
          class="btn btn-ghost btn-circle"
          data-test="user-button"
        >
          <FontAwesomeIcon icon="user" class="text-xl" />
        </button>
      </div>

      <div class="navbar-center">
        <img src="/" alt="Logo" class="h-6" />
      </div>

      <div class="navbar-end">
        <button
          v-if="showSearch"
          class="btn btn-ghost btn-circle"
          @click="isSearching = !isSearching"
          data-test="search-button"
        >
          <FontAwesomeIcon icon="search" class="text-xl" />
        </button>
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="isSearching"
        class="bg-base-100 px-4 pt-3 pb-4 border-t border-base-300"
      >
        <InputField
          :autofocus="isSearching"
          :modelValue="modelValue"
          placeholder="Search..."
          @update:modelValue="handleInput"
          label="Seach Field"
          note=""
          @blur="isSearching = false"
        />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
