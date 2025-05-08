<template>
  <div class="min-h-screen flex flex-col">
    <app-header :show-back="true" />
    <div class="flex-1 flex items-center justify-center ">
      <div class="w-3/4 max-w-md">
        <multi-step-form
          :total-steps=3
          @submit="handleSubmit()"
          @step-changed="handleStepChange"
        >
          <template #step1>
            <input-field
              v-model="userFormData.first_name"
              label="First Name"
              placeholder="Max"  
            />
            <input-field
              v-model="userFormData.last_name"
              label="Last Name"
              placeholder="Mustermann"  
            />
          </template>

          <template #step2>
            <tag-selector
              :all-tags="DbTags"
              :max-selection=10
              @update:selected-tags="tags = $event"
            />
          </template>

          <template #step3>
            <TagPriority
              :tags="tags"
              @update:tags="tags = $event"
            />
          </template>
        </multi-step-form>
      </div>
    </div>
  </div> 
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import type { UserCreateData, UserData } from '~/shared/types/userInterfaces';
import type { tagData } from '~/shared/types/tagInterfaces';
import { useUserStore } from '~/stores/useUserStore'


definePageMeta({
  layout: "authenticated",
});

const { isLoaded, isSignedIn, user } = useUser();
const  { getTags } = useTagApi();
const { createUser, addUserTag } = useUserApi();
const userStore = useUserStore();

const userFormData = ref({} as UserCreateData);

const DbTags = ref([] as tagData[]);
const tags = ref([] as tagData[]);

async function handleStepChange(step: number): Promise<void> {
  if (step == 2 && user.value?.primaryEmailAddress) {
    userFormData.value.email = user.value.primaryEmailAddress.emailAddress; 
    const res = await createUser(userFormData.value) as UserData;
    userStore.setUser(res);
  }
  console.log(userStore.user)
}

async function handleSubmit() {
  console.log('tags', tags.value)
  addUserTag({id: userStore.user?.id, tags: tags.value as tagData[]});
}


const finishOnboarding = async () => {
  if (!isLoaded.value || !isSignedIn.value || !user.value) return;

  try {
    await user.value.update({ unsafeMetadata: { onboardingCompleted: false } });

    //return navigateTo(`/dashboard`);
  } catch (err) {
    console.error("Onboarding error:", err);
  }
};

const fetchAlldata = async () =>{ 
  DbTags.value = await getTags();
}
(async () => {
  await fetchAlldata();
})();

</script>
