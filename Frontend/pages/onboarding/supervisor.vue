<template>
  <div class="h-screen flex flex-col">
    <app-header :show-user="true"/>
    <div class="flex-1 flex p-8 flex-col items-center size-full">
      <multi-step-form
          :button-text="buttonText"
          :description-text="descriptionText"
          :total-steps="2"
          class="size-full flex flex-col gap-8"
          @submit="handleSubmit()"
      >
        <template #step1>
          <tag-selector
              :all-tags="DbTags"
              :max-selection="10"
              @update:selected-tags="
								tags = $event
							"
          />
        </template>

        <template #step2>
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
import { onMounted, ref } from 'vue';
import { useUser } from '@clerk/nuxt/composables';
import type { tagData } from '~/shared/types/tagInterfaces';
import type { UserCreateData, UserData, } from '~/shared/types/userInterfaces';

const { t } = useI18n();


const { user } = useUser();
const { createUser, addUserTag } = useUserApi();
const { getTags } = useTagApi();
const userStore = useUserStore();

const DbTags = ref([] as tagData[]);
const tags = ref([] as tagData[]);

const buttonText = [
  t('multiStepForm.tagPriority'),
  t('multiStepForm.seeMatches'),
];

const descriptionText = [
  t('multiStepForm.description.tag.supervisor'),
  t('multiStepForm.description.priority.supervisor'),
]

onMounted(async () => {
  if (!user.value) return navigateTo('/');

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

const handleSubmit = () => {
  addUserTag({
    id: userStore.user?.id,
    tags: tags.value as tagData[],
  });
  navigateTo('/supervisor/dashboard');
};
</script>
