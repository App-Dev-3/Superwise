<script lang="ts" setup>
import { useRoute } from 'vue-router';

const route = useRoute();

</script>

<template>
  <div class="w-full h-screen flex max-w-xl m-auto flex-col p-6">
    <slot/>
  </div>
</template>

<style scoped>

</style>