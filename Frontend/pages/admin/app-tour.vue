<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const authStore = useAuthStore();
await authStore.initialize();
const { user } = storeToRefs(authStore);
const userEmail = user.value?.primaryEmailAddress?.emailAddress;
const registrationStore = useRegistrationStore();

const registerNewAdmin = async () => {
    if (!userEmail) {
        console.error('User email is not available');
        return;
    }
    console.log('registerNewAdmin with email:', userEmail);

    $fetch('/api/users', {
        method: 'POST',
        body: {
            email: userEmail
        }
    })
        .then(() => {
            navigateTo('/dashboard/admin');
        })
        .catch((error) => {
            console.error('Error registering new admin:', error);
        });
};
const steps = [
  {
    source: '../appTour/admin/dashboard.jpeg',
    alt: t('appTour.admin.dashboard.alt'),
    title: t('appTour.admin.dashboard.title'),
    description: t('appTour.admin.dashboard.description')
  },
  {
    source: '../appTour/admin/upload.jpeg',
    alt: t('appTour.admin.upload.alt'),
    title: t('appTour.admin.upload.title'),
    description: t('appTour.admin.upload.description')
  },
  {
    source: '../appTour/admin/download.jpeg',
    alt: t('appTour.admin.download.alt'),
    title: t('appTour.admin.download.title'),
    description: t('appTour.admin.download.description')
  },
  {
    source: '../appTour/admin/profile.jpeg',
    alt: t('appTour.admin.profile.alt'),
    title: t('appTour.admin.profile.title'),
    description: t('appTour.admin.profile.description')
  },
];

const currentStep = ref(0);

function next() {
  if (currentStep.value === steps.length - 1) {
      if (!registrationStore.status.is_registered) {
          registerNewAdmin()
      } else {
          close();
      }
  }
  currentStep.value = Math.min(steps.length - 1, currentStep.value + 1);
}

function back() {
  currentStep.value = Math.max(0, currentStep.value - 1);
}

function close() {
  navigateTo('/dashboard/admin');
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