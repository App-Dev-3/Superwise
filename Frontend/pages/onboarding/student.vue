<template>
  <div class="h-screen flex flex-col">
    <app-header :show-user="true"/>
    <div class="flex-1 flex p-8 flex-col items-center size-full">
      <multi-step-form
          :button-text="buttonText"
          :description-text="descriptionText"
          :total-steps="3"
          class="size-full flex flex-col gap-8"
          @submit="handleSubmit"
          @step-changed="handleStepChange"
      >
        <template #step1>
          <input-field
              v-model="userFormData.first_name"
              :label="t('onboarding.firstName')"
              class="mt-32"
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
              :max-selection="10"
              @update:selected-tags="
								tags = $event
							"
          />
        </template>

        <template #step3>
          <TagPriority
              :tags="tags"
              @update:tags="
								tags = $event
							"
          />
        </template>
      </multi-step-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserCreateData, UserData, } from '~/shared/types/userInterfaces';
import type { tagData } from '~/shared/types/tagInterfaces';
import { useUserStore } from '~/stores/useUserStore';
import { useRegistrationStore } from '~/stores/useRegistrationStore';

const { t } = useI18n();
const { user } = useUser();
const { getTags } = useTagApi();
const { createUser, addUserTag } = useUserApi();
const userStore = useUserStore();
const registrationStore = useRegistrationStore();

const userFormData = ref({} as UserCreateData);

const DbTags = ref([] as tagData[]);
const tags = ref([] as tagData[]);

const buttonText = [
  t('multiStepForm.selectTags'),
  t('multiStepForm.tagPriority'),
  t('multiStepForm.startMatching'),
];

const descriptionText = [
  t('multiStepForm.description.name'),
  t('multiStepForm.description.tag.student'),
  t('multiStepForm.description.priority.student'),
]

async function handleStepChange(step: number): Promise<void> {
  if (step == 2 && user.value?.primaryEmailAddress) {
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
        return navigateTo('/student/dashboard');
      } else {
        console.error(
            'Unexpected error:',
            error,
        );
        await navigateTo('/');
      }
    }
  }
}

async function handleSubmit() {
  if (!userStore.user) {
    return;
  }
  await useUserApi().createStudentProfile('');
  addUserTag({
    id: userStore.user.id,
    tags: tags.value as tagData[],
  });
  await registrationStore.fetchRegistrationStatus(
      userStore.user?.email,
  );
  return navigateTo('/student/dashboard');
}

const fetchAlldata = async () => {
  DbTags.value = await getTags();
};
</script>
