<script lang="ts" setup>

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

interface CustomMessageProps {
  message: string;
  type: "success" | "warn" | "info";
}

const props = defineProps<CustomMessageProps>();

const messageIcon = computed(() => {
  switch (props.type) {
    case "success":
      return "check";
    case "warn":
      return "triangle-exclamation";
    default:
      return "info-circle";
  }
})

</script>

<template>

  <div class="flex flex-row bg-base-100 border border-neutral-content rounded-3xl items-center h-fit w-full shadow-xl">
    <div
        :class="{
          'bg-success': props.type=='success',
          'bg-[var(--color-warning)]': props.type=='warn',
          'bg-[var(--color-info)]': props.type=='info'
        }"
        class="size-10 min-w-10 min-h-10 m-4 flex items-center justify-center rounded-2xl ">
      <FontAwesomeIcon
          :class="{
            'text-success-content': props.type=='success',
            'text-[var(--color-warning-content)]': props.type=='warn',
            'text-[var(--color-info-content)]': props.type=='info'
           }"
          :icon="messageIcon"
      />
    </div>
    <p class="text-body p-4 pl-0 opacity-75">
      {{ props.message }}
    </p>
  </div>

</template>

<style scoped>

</style>