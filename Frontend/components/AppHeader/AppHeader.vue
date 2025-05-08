<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";
import { useColorMode } from "#imports";

const router = useRouter();
const colorMode = useColorMode();

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
    default: "",
  },
});

const isSearching = ref(false);

const emit = defineEmits(["update:modelValue"]);

function handleInput(value) {
  emit("update:modelValue", value);
}

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="w-full">
    <div class="navbar bg-base-100 shadow z-10">
      <div class="navbar-start ps-3">
        <button
          v-if="props.showBack"
          class="btn btn-ghost btn-circle"
          data-test="back-button"
          @click="goBack"
        >
          <FontAwesomeIcon icon="arrow-left" class="text-xl" />
          <span class="text-sm font-medium opacity-50">Back</span>
        </button>

        <UserButton v-if="props.showUser" />
      </div>

      <ClientOnly>
        <div class="navbar-center">
          <img 
            :src="colorMode.value === 'dark' ? 
              '../images/appHeader_logo_dark.svg' 
              : '../images/appHeader_logo_light.svg'"
            alt="Logo image" 
            class="h-6" >
        </div>
      </ClientOnly>

      <div class="navbar-end">
        <button
          v-if="props.showSearch"
          class="btn btn-ghost btn-circle"
          data-test="search-button"
          @click="isSearching = !isSearching"
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
          :auto-focus="isSearching"
          :model-value="props.modelValue"
          placeholder="Search..."
          label="Search Field"
          note=""
          right-icon="xmark"
          @update:model-value="handleInput"
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
