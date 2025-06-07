<script lang="ts" setup>

</script>

<template>
  <div class="rounded-3xl border border-base-300 flex flex-col w-full h-fit p-8 gap-3">
    <div class="flex flex-row gap-6 items-center w-full pr-8">
      <div class="mask mask-squircle w-fit h-fit">
        <div class="skeleton h-14 w-14"/>
      </div>
      <span class="skeleton h-4 w-full"/>
    </div>
    <div class="flex flex-row gap-4">
      <div
          v-for="i in 4"
          :key="i"
          class="skeleton w-12 h-6"
      />
    </div>
  </div>
</template>

<style scoped>

</style>