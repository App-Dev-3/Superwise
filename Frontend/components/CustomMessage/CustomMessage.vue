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

  <div
      :class="{
        'shadow-xl': props.type=='success',
        '': props.type=='warn',
        '': props.type=='info'
      }"
      class="flex flex-row bg-base-100 border border-neutral-content rounded-3xl items-center h-fit w-full">
    <div class="size-8 m-8 flex items-center justify-center rounded-xl bg-success">
      <FontAwesomeIcon
          :class="{
          'text-success-content': props.type=='success',
          '': props.type=='warn',
          '': props.type=='info'
        }"
          :icon="messageIcon"
      />
    </div>
    <p class="text-body pr-8 opacity-75">
      {{ props.message }}
    </p>
  </div>

</template>

<style scoped>

</style>