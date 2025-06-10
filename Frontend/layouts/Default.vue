<template>
  <div
      v-if="isLoading"
      class="w-full h-screen flex max-w-3xl m-auto flex-col p-8 justify-center items-center"
  >
    <ClientOnly>
      <img
          :src="
          colorMode.value === 'dark'
            ? '../images/appHeader_logo_dark.svg'
            : '../images/appHeader_logo_light.svg'
        "
          alt="Logo image"
          class="w-full max-w-xs"
      >
    </ClientOnly>
    <span class="text-large flex flex-row items-center gap-1">
      {{ t("generic.loading") }}
      <span class="loading loading-dots loading-xs translate-y-1"/>
    </span>
  </div>

  <div v-else class="w-full h-screen flex max-w-3xl m-auto flex-col">
    <slot/>
  </div>
</template>

<script lang="ts" setup>
import { until } from "@vueuse/core";
import { onMounted } from "vue";
import { useColorMode } from "#imports";

const { t } = useI18n();

const colorMode = useColorMode();

const authStore = useAuthStore();
await authStore.initialize();
const { isLoaded } = storeToRefs(authStore);
const isLoading = ref(true);

onMounted(async () => {
  await authStore.initialize();
  await until(isLoaded).toBe(true);
  isLoading.value = false;
});
</script>
