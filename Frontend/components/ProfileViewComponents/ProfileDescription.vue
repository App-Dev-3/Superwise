<script lang="ts" setup>
import {ref} from 'vue';

interface Props {
  headline: string;
  content: string;
}

const props = defineProps<Props>();

const isOpen = ref(false);

</script>

<template>
  <div class="w-full">
    <div class="flex flex-col gap-3 items-start">
      <h3 class="text-large">{{ props.headline }}</h3>

      <p
        :class="{ 'line-clamp-4': !isOpen}"
        class="text-body opacity-75"
      >
        {{ content.trim() }}
      </p>

      <CustomButton
        :left-icon="isOpen ? 'eye-slash' : 'eye'"
        :text="isOpen ? 'Show all...' : 'Show more...'"
        class="p-0 m-0 opacity-75"
        color="default"
        size="xs"
        variant="ghost"
        @click="isOpen = !isOpen"
      />
    </div>
  </div>
</template>

<style scoped>

</style>