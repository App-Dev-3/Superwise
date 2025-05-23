<template>
  <div
      v-if="isLoading"
      class="w-full h-screen flex max-w-3xl m-auto flex-col p-8 justify-center items-center"
  >
    <ClientOnly>
      <img
          :src="colorMode.value === 'dark' ?
              '../images/appHeader_logo_dark.svg'
              : '../images/appHeader_logo_light.svg'"
          alt="Logo image"
          class="w-full max-w-xs">
    </ClientOnly>
    <span class="text-large flex flex-row items-center gap-1">
      Loading page
      <span class="loading loading-dots loading-xs translate-y-1"/>
    </span>
  </div>

  <div
      v-else
      class="w-full h-screen flex max-w-3xl m-auto flex-col"
  >
    <CustomSelect
        :model-value="locale"
        :options="locales.map(locale => ({key: locale.code, value: $t('generic.'+locale.name)}))"
        class="absolute top-4 right-4"
        label="Select Language"
        placeholder="Select Language"
        @update:model-value="setLocale"
    />

    <slot/>
  </div>
</template>

<script lang="ts" setup>
import { until } from '@vueuse/core';
import { onMounted } from 'vue';
import { useColorMode } from "#imports";
import type { Locale } from "@intlify/core-base";

const { locale, locales, setLocale } = useI18n()


const colorMode = useColorMode();

const { isLoaded } = useUser();
const isLoading = ref(true);
onMounted(async () => {
  await until(isLoaded).toBe(true);
  isLoading.value = false;
})

const availableLocales: Locale = computed(() => {
  return locales.value.filter(i => i.code !== locale.value)
})
</script>
