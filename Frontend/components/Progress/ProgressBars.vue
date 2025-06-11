<script lang="ts" setup>

interface ProgressBarProps {
  totalSteps: number;
  currentStep: number;
}

const props = defineProps<ProgressBarProps>();

</script>

<template>
  <div class="w-full h-fit gap-3">
    <div
        v-for="i in props.totalSteps"
        :key="i"
        :class="{'bg-primary': props.currentStep >= i, 'bg-base-300': props.currentStep < i}"
        class="h-3 w-full"
    />
  </div>
</template>

<style scoped>

</style>