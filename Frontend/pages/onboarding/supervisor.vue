<template>
  <div v-if="!processingData" class="size-full flex flex-col">
    <toast
        v-if="toastInformation.visible"
        :message="toastInformation.message"
        :type="toastInformation.type"
        @close="toastInformation.visible = false"
        @button-click="toastInformation.visible = false"
    />
    <multi-step-form
        ref="multiStepFormRef"
        :button-text="buttonText"
        :description-text="descriptionText"
        :header-text="headerText"
        :total-steps="2"
        class="size-full flex flex-col gap-8"
        @submit="handleSubmit()"
        @step-changed="handleStepChange"

    >
      <template #step1>
        <tag-selector
            :all-tags="DbTags"
            :description-text="descriptionText[0]"
            :initial-selected="[]"
            :max-selection="10"
            @update:selected-tags="
                  tags = $event
                "
        />
      </template>

      <template #step2>
        <TagPriority
            :description-text="descriptionText[1]"
            :tags="tags"
            @update:tags="
                  tags = $event
                "
        />
      </template>
    </multi-step-form>
  </div>
  <div v-else>
    <LoadingIndicator
        :text="t('onboarding.processing')"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import type { tagData } from '~/shared/types/tagInterfaces';
import type { UserCreateData, UserData, } from '~/shared/types/userInterfaces';

const { t } = useI18n();

const authStore = useAuthStore()
await authStore.initialize()
const { user } = storeToRefs(authStore)
const { createUser, addUserTag } = useUserApi();
const registrationStore = useRegistrationStore();
const { getTags } = useTagApi();
const userStore = useUserStore();

const DbTags = ref([] as tagData[]);
const tags = ref([] as tagData[]);
const multiStepFormRef = ref();
const toastInformation = ref({
  visible: false,
  message: '',
  type: 'success',
});
const processingData = ref(false);

const buttonText = [
  t('multiStepForm.tagPriority'),
  t('nav.appTour'),
];

const descriptionText = [
  t('multiStepForm.description.tag.supervisor'),
  t('multiStepForm.description.priority.supervisor'),
]


const headerText = [
  t('appHeader.onboarding.tags'),
  t('appHeader.onboarding.priority'),
];

onMounted(async () => {
  if (!user.value) return navigateTo('/');
  if (!registrationStore.status || !registrationStore.status.exists || !registrationStore.status.is_registered) {
    await registrationStore.fetchRegistrationStatus(user.value.primaryEmailAddress?.emailAddress)
  }
  if (registrationStore.status?.is_registered) {
    DbTags.value = (await getTags()) as tagData[];
    return
  }

  try {
    const res = (await createUser({
      email: user.value.primaryEmailAddress
          ?.emailAddress,
    } as UserCreateData)) as UserData;
    userStore.setUser(res);
    DbTags.value = (await getTags()) as tagData[];
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

const handleStepChange = (step: number) => {
  if (step === 2) {
    if (tags.value.length === 0) {
      multiStepFormRef.value.goToStep(1);
      toastInformation.value = {
        visible: true,
        message: t('onboarding.error.missingTags'),
        type: 'error',
      };
    }
  }
};

const handleSubmit = async () => {
  processingData.value = true;
  if (!userStore.user) {
    await userStore.refetchCurrentUser();
  }
  await addUserTag({
    id: userStore.user?.id,
    tags: tags.value as tagData[],
  });
  return navigateTo('/supervisor/app-tour');
};


definePageMeta({
  layout: "onboarding-layout",
});
</script>
