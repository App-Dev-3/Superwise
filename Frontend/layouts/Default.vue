<template>
  <div
    v-if="isLoading"
  > Loading mf 
  </div>

  <div 
    v-else
    class="w-full h-screen flex max-w-3xl m-auto flex-col"
  >
    <slot />  
  </div>
</template>

<script setup lang="ts">
import { until } from '@vueuse/core';
import { onMounted } from 'vue';

const { isLoaded } = useUser();
const isLoading = ref(true);
onMounted(async() => {
  await until(isLoaded).toBe(true);
  isLoading.value = false;
})
</script>
