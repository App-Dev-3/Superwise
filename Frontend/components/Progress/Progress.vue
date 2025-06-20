<script lang="ts" setup>

interface ProgressProps {
  progress: number;
  text: string;
}

const props = defineProps<ProgressProps>();

</script>

<template>
  <div class="w-full h-fit flex flex-row p-6 gap-6 items-center border-b border-b-base-300">
    <div>
      <div
          :style="'--value:'+props.progress+';'" aria-valuenow="70"
          class="radial-progress bg-success text-success-content border-success border-4"
          role="progressbar"
      >
        {{ props.progress }}%
      </div>
    </div>
    <p class="text-body opacity-75">
      {{ props.text }}
    </p>
  </div>
</template>

<style scoped>

</style>