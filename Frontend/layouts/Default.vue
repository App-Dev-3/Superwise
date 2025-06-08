<template>
  <div
      v-if="isLoading"
      class="w-full h-screen flex max-w-xl m-auto flex-col justify-center items-center p-8"
  >
    <LoadingIndicator
        :text="t('generic.loading')"
    />
  </div>

  <div v-else class="w-full h-screen flex max-w-xl m-auto flex-col">
    <slot/>
  </div>
</template>

<script lang="ts" setup>
import { until } from "@vueuse/core";
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const authStore = useAuthStore()
await authStore.initialize()
const { isLoaded } = storeToRefs(authStore)
const isLoading = ref(true);

onMounted(async () => {
  await authStore.initialize();
  await until(isLoaded).toBe(true);
  isLoading.value = false;
});
</script>
