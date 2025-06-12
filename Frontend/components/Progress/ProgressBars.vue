<script lang="ts" setup>

interface ProgressBarProps {
  totalSteps: number;
  currentStep: number;
}

const props = defineProps<ProgressBarProps>();

</script>

<template>
  <div class="w-full h-fit gap-3 flex flex-row">
    <div
        v-for="i in props.totalSteps"
        :key="i"
        :class="{'bg-primary opacity-75': props.currentStep >= i-1, 'bg-base-300': props.currentStep < i-1}"
        class="h-3 w-full rounded-full"
    />
  </div>
</template>

<style scoped>

</style>