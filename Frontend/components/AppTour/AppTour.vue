<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

interface AppTourProps {
  steps: Array<{
    source: string;
    alt: string;
    title: string;
    description: string;
  }>;
  currentStep: number;
}

const props = defineProps<AppTourProps>();

const currentStepRef = computed(() => {
  return props.steps[props.currentStep];
});

const { t } = useI18n();
</script>

<template>
  <div
      class="flex-1 min-h-0 size-full p-8 flex flex-col gap-8 overflow-y-auto"
  >
    <ProgressBars
        :current-step="props.currentStep"
        :total-steps="props.steps.length"
    />

    <div
        class="flex-1 min-h-0 w-fit flex self-center border-4 border-base-300 rounded-3xl shadow-inner overflow-clip"
    >
      <img
          v-if="currentStepRef.source.endsWith('jpeg')"
          :alt="currentStepRef.alt"
          :src="currentStepRef.source"
          class="max-h-full w-auto object-cover"
      >
      <video
          v-else
          :key="currentStepRef.source"
          :aria-label="currentStepRef.alt"
          autoplay
          class="max-h-full w-auto object-cover"
          loop
      >
        <source
            :src="currentStepRef.source"
            type="video/mp4"
        >
        {{ t('generic.noVideoSupport') }}
      </video>
    </div>

    <div class="flex flex-col gap-2 w-full h-fit">
      <h2 class="text-large">
        {{ currentStepRef.title }}
      </h2>
      <p class="text-body">
        {{ currentStepRef.description }}
      </p>
    </div>
  </div>
</template>

<style scoped></style>
