<script lang="ts" setup>

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

interface CustomAccordionProps {
  title?: string;
}

const props = withDefaults(defineProps<CustomAccordionProps>(), {
  title: 'Frequently Asked Questions',
});

const isOpen: boolean = ref(false);

</script>

<template>
  <div class="w-full h-fit max-h-full">
    <!-- Toggle Area -->
    <div
        class="w-full border-b border-b-base-300 p-1 px-2 flex flex-row items-center justify-between cursor-pointer mb-2"
        @click="isOpen = !isOpen"
    >
      <h2>
        {{ props.title }}
      </h2>
      <FontAwesomeIcon
          :icon="isOpen ? 'caret-down':'caret-up'"
          class="text-base-content text-lg ml-2"
      />
    </div>
    <!-- Content Area-->

    <slot v-if="isOpen"/>
  </div>
</template>

<style scoped>

</style>