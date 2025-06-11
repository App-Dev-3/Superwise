<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const steps = [
  {
    source: '../appTour/dashboard.jpeg',
    alt: t('appTour.dashboard.student.alt'),
    title: t('appTour.dashboard.student.title'),
    description: t('appTour.dashboard.student.description')
  },
  {
    source: '../appTour/matching.jpeg',
    alt: t('appTour.matching.student.alt'),
    title: t('appTour.matching.student.title'),
    description: t('appTour.matching.student')
  },
  {
    source: '../appTour/profile.jpeg',
    alt: t('appTour.profile.student.alt'),
    title: t('appTour.profile.student.title'),
    description: t('appTour.profile.student.description')
  },
  {
    source: '../appTour/demo.mp4',
    alt: t('appTour.overview.student.alt'),
    title: t('appTour.overview.student.title'),
    description: t('appTour.overview.student.description')
  },
];

const currentStep = ref(0);

function next() {
  currentStep.value = Math.min(steps.length - 1, currentStep.value + 1);
}

function back() {
  currentStep.value = Math.max(0, currentStep.value - 1);
}

const nextText = computed(() => {
  switch (currentStep.value) {
    case steps.length - 1:
      return t('appTour.finish');
    default:
      return t('multiStepForm.next');
  }
});

</script>

<template>
  <div>
    <AdminHeader
        :header-text="t('nav.appTour')"
        :right-button="t('generic.close')"
        right-icon="xmark"
    />
    <div class="size-full p-8 gap-4">
      <ProgressBars
          :current-step="currentStep"
          :total-steps="steps.length"
      />

      <div class="size-full border-4 border-base-300">
        <img
            v-if="steps[currentStep].source.endsWith('jpeg')"
            :alt="steps[currentStep].alt"
            :src="steps[currentStep].source"
            class="size-full"
        >
        <video
            v-else
            autoplay
            class="size-full"
            loop
        >
          <source :src="steps[currentStep].source">
        </video>
      </div>

      <div class="flex flex-col gap-2 w-full h-fit">
        <h2 class="text-large">
          {{ steps[currentStep].title }}
        </h2>
        <p class="text-body">
          {{ steps[currentStep].description }}
        </p>
      </div>
    </div>
    <div class="flex w-full h-fit p-8 pt-0 gap-3">
      <CustomButton
          :is-active="currentStep != 0"
          :text="t('appHeader.back')"
          btn-type="default"
          wide
          @click="back"
      />
      <CustomButton
          :text="nextText"
          btn-type="primary"
          wide
          @click="next"
      />
    </div>
  </div>
</template>

<style scoped>

</style>