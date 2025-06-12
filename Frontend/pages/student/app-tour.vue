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
  if (currentStep.value === steps.length - 1) {
    close();
  }
  currentStep.value = Math.min(steps.length - 1, currentStep.value + 1);
}

function back() {
  currentStep.value = Math.max(0, currentStep.value - 1);
}

function close() {
  navigateTo('/student/dashboard');
}

const nextText = computed(() => {
  switch (currentStep.value) {
    case steps.length - 1:
      return t('generic.close');
    default:
      return t('multiStepForm.next');
  }
});

definePageMeta({
  layout: "onboarding-layout",
});

</script>

<template>
  <div class="flex flex-col size-full min-h-0">
    <AdminHeader
        :header-text="t('nav.appTour')"
        :right-button="t('generic.close')"
        right-icon="xmark"
        @right-button-click="close"
    />
    <div class="flex-1 min-h-0 size-full p-4 flex flex-col gap-4 overflow-y-auto">
      <ProgressBars
          :current-step="currentStep"
          :total-steps="steps.length"
      />

      <div
          class="flex-1 min-h-0 w-fit flex self-center border-4 border-base-300 rounded-3xl shadow-inner overflow-clip">
        <img
            v-if="steps[currentStep].source.endsWith('jpeg')"
            :alt="steps[currentStep].alt"
            :src="steps[currentStep].source"
            class="max-h-full w-auto object-cover"
        >
        <video
            v-else
            autoplay
            class="max-h-full w-auto object-cover"
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
          :text="t('appHeader.back')"
          block
          color="default"
          left-icon="arrow-left"
          @click="back"
      />
      <CustomButton
          :text="nextText"
          block
          color="primary"
          right-icon="arrow-right"
          @click="next"
      />
    </div>
  </div>
</template>

<style scoped>

</style>