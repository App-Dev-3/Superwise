<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

interface SettingsAreaProps {
  title: string;
  icon: string;
}

const props = defineProps<SettingsAreaProps>();
</script>

<template>
  <div class="w-full flex flex-col gap-1 max-w-md self-center">
    <span class="text-large px-6 opacity-75 flex flex-row gap-2 items-center">
      <FontAwesomeIcon :icon="icon" class="text-body" />
      {{ props.title }}
    </span>

    <div
      class="border border-base-300 bg-base-100 p-8 rounded-3xl flex flex-col gap-4"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped></style>
