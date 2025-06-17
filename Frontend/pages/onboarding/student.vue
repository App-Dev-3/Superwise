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
        :total-steps="3"
        class="size-full flex flex-col"
        @submit="handleSubmit"
        @step-changed="handleStepChange"
    >
      <template #step1>
        <div class="flex flex-col gap-2 pb-4">
          <p class="text-large">{{ t('onboarding.name.title') }}</p>

          <p class="text-x-small opacity-50">
            {{ descriptionText[0] }}
          </p>
        </div>
        <input-field
            v-model="userFormData.first_name"
            :label="t('onboarding.firstName')"
            placeholder="Max"
        />
        <input-field
            v-model="
                  userFormData.last_name
                "
            :label="t('onboarding.lastName')"
            placeholder="Mustermann"
        />
      </template>

      <template #step2>
        <tag-selector
            :all-tags="DbTags"
            :description-text="descriptionText[1]"
            :initial-selected="[]"
            :max-selection="10"
            @update:selected-tags="
                  tags = $event
                "
        />
      </template>

      <template #step3>
        <TagPriority
            :description-text="descriptionText[2]"
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
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserCreateData, UserData, } from '~/shared/types/userInterfaces';
import type { tagData } from '~/shared/types/tagInterfaces';
import { useUserStore } from '~/stores/useUserStore';
import { useRegistrationStore } from '~/stores/useRegistrationStore';
import { HttpMethods } from '~/shared/enums/enums';

const { t } = useI18n();
const authStore = useAuthStore()
await authStore.initialize()
const { user } = storeToRefs(authStore)
const { getTags } = useTagApi();
const { createUser, addUserTag } = useUserApi();
const userStore = useUserStore();
const registrationStore = useRegistrationStore();

const userFormData = ref({} as UserCreateData);

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
  t('multiStepForm.selectTags'),
  t('multiStepForm.tagPriority'),
  t('nav.appTour'),
];

const descriptionText = [
  t('multiStepForm.description.name'),
  t('multiStepForm.description.tag.student'),
  t('multiStepForm.description.priority.student'),
]

const headerText = [
  t('appHeader.onboarding.name'),
  t('appHeader.onboarding.tags'),
  t('appHeader.onboarding.priority'),
];

onMounted(async () => {
  if (registrationStore.status?.is_registered) {
    await fetchAlldata();
    multiStepFormRef.value.goToStep(2);
  }
});

async function handleStepChange(step: number): Promise<void> {
  if (step == 1 && registrationStore.status?.is_registered) {
    multiStepFormRef.value.goToStep(2);
  }
  if (
      step == 2 &&
      user.value?.primaryEmailAddress &&
      !userStore.user &&
      !registrationStore.status?.is_registered
  ) {
    if (!userFormData.value.first_name || !userFormData.value.last_name) {
      multiStepFormRef.value.goToStep(1);
      toastInformation.value = {
        visible: true,
        message: t('onboarding.error.missingName'),
        type: 'error',
      };
      return;
    }
    userFormData.value.email =
        user.value.primaryEmailAddress.emailAddress;
    try {
      const res = (await createUser(
          userFormData.value,
      )) as UserData;
      userStore.setUser(res);
      await fetchAlldata();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error creating user:', error);

      if (
          error.statusCode === 400 &&
          error.message.includes(
              'Unique constraint violation',
          )
      ) {
        console.warn(
            'User already registered. Skipping registration.',
        );
        return navigateTo('/student/app-tour');
      } else {
        console.error(
            'Unexpected error:',
            error,
        );
        await navigateTo('/');
      }
    }
  }
  if (step == 3) {
    if (tags.value.length === 0) {
      multiStepFormRef.value.goToStep(2);
      toastInformation.value = {
        visible: true,
        message: t('onboarding.error.missingTags'),
        type: 'error',
      };
    }
  }
}

async function handleSubmit() {
  processingData.value = true;
  let userProfileExists = false;
  if (!userStore.user || !userStore.user.id) {
    await userStore.refetchCurrentUser();
  }

  try {
    const data = await $fetch(`/api/students/user/${ userStore.user?.id }`, {
      method: HttpMethods.GET,
    });
    if (data) {
      userProfileExists = true;
    }
  } catch {
    // User profile does not exist, we will create it
  }

  if (!userProfileExists) {
    await useUserApi().createStudentProfile('');
  }
  await addUserTag({
    id: userStore.user?.id || '',
    tags: tags.value as tagData[],
  });
  if (!registrationStore.status || !registrationStore.status.exists || !registrationStore.status.is_registered) {
    await registrationStore.fetchRegistrationStatus(userStore.user?.email)
  }
  return navigateTo('/student/dashboard');
}

const fetchAlldata = async () => {
  DbTags.value = await getTags();
};

definePageMeta({
  layout: "onboarding-layout",
});
</script>
