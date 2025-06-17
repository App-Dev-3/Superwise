<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();


const steps = [
  {
    source: '../appTour/supervisor/dashboard.jpeg',
    alt: t('appTour.supervisor.dashboard.alt'),
    title: t('appTour.supervisor.dashboard.title'),
    description: t('appTour.supervisor.dashboard.description')
  },
  {
    source: '../appTour/supervisor/matching.mp4',
    alt: t('appTour.supervisor.matching.alt'),
    title: t('appTour.supervisor.matching.title'),
    description: t('appTour.supervisor.matching.description')
  },
  {
    source: '../appTour/supervisor/profile.mp4',
    alt: t('appTour.supervisor.profile.alt'),
    title: t('appTour.supervisor.profile.title'),
    description: t('appTour.supervisor.profile.description')
  },
  {
    source: '../appTour/supervisor/manage.mp4',
    alt: t('appTour.supervisor.manage.alt'),
    title: t('appTour.supervisor.manage.title'),
    description: t('appTour.supervisor.manage.description')
  },
  {
    source: '../appTour/supervisor/demo.mp4',
    alt: t('appTour.supervisor.overview.alt'),
    title: t('appTour.supervisor.overview.title'),
    description: t('appTour.supervisor.overview.description')
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
  navigateTo('/supervisor/dashboard');
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