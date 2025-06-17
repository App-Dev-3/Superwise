<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const steps = [
  {
    source: '../appTour/student/dashboard.jpeg',
    alt: t('appTour.student.dashboard.alt'),
    title: t('appTour.student.dashboard.title'),
    description: t('appTour.student.dashboard.description')
  },
  {
    source: '../appTour/student/matching.mp4',
    alt: t('appTour.student.matching.alt'),
    title: t('appTour.student.matching.title'),
    description: t('appTour.student.matching.description')
  },
  {
    source: '../appTour/student/profile.mp4',
    alt: t('appTour.student.profile.alt'),
    title: t('appTour.student.profile.title'),
    description: t('appTour.student.profile.description')
  },
  {
    source: '../appTour/student/demo.mp4',
    alt: t('appTour.student.overview.alt'),
    title: t('appTour.student.overview.title'),
    description: t('appTour.student.overview.description')
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
    <AppTour
        :current-step="currentStep"
        :steps="steps"
    />
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