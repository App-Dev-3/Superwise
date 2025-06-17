<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();


const steps = [
  {
    source: '../appTour/supervisors/dashboard.jpeg',
    alt: t('appTour.dashboard.supervisor.alt'),
    title: t('appTour.dashboard.supervisor.title'),
    description: t('appTour.dashboard.supervisor.description')
  },
  {
    source: '../appTour/supervisors/matching.mp4',
    alt: t('appTour.matching.supervisor.alt'),
    title: t('appTour.matching.supervisor.title'),
    description: t('appTour.matching.supervisor.description')
  },
  {
    source: '../appTour/supervisors/profile.mp4',
    alt: t('appTour.profile.supervisor.alt'),
    title: t('appTour.profile.supervisor.title'),
    description: t('appTour.profile.supervisor.description')
  },
  {
    source: '../appTour/supervisors/manage.mp4',
    alt: t('appTour.manage.supervisor.alt'),
    title: t('appTour.manage.supervisor.title'),
    description: t('appTour.manage.supervisor.description')
  },
  {
    source: '../appTour/supervisors/demo.mp4',
    alt: t('appTour.overview.supervisor.alt'),
    title: t('appTour.overview.supervisor.title'),
    description: t('appTour.overview.supervisor.description')
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