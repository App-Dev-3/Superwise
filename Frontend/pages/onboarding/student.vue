<template>
  <div class="min-h-screen flex flex-col">
    <app-header :show-user="true" />
    <div class="flex-1 flex items-center justify-center ">
      <div class="w-3/4 max-w-md">
        <multi-step-form
          :total-steps=3
          @submit="handleSubmit"
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
import { ref } from 'vue';

import type { UserCreateData, UserData } from '~/shared/types/userInterfaces';
import type { tagData } from '~/shared/types/tagInterfaces';
import { useUserStore } from '~/stores/useUserStore'
import { useRegistrationStore } from '~/stores/useRegistrationStore';

const { user } = useUser();
const  { getTags } = useTagApi();
const { createUser, addUserTag } = useUserApi();
const userStore = useUserStore();
const registrationStore = useRegistrationStore()


const userFormData = ref({} as UserCreateData);

const DbTags = ref([] as tagData[]);
const tags = ref([] as tagData[]);

async function handleStepChange(step: number): Promise<void> {
  if (step == 2 && user.value?.primaryEmailAddress) {
    userFormData.value.email = user.value.primaryEmailAddress.emailAddress; 
    try {
      const res = await createUser(userFormData.value) as UserData;
      userStore.setUser(res);
      await fetchAlldata();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error creating user:', error);

      if (error.statusCode === 400 && error.message.includes('Unique constraint violation')) {
        console.warn('User already registered. Skipping registration.');
        return navigateTo('/student/dashboard');
      } else {
        console.error('Unexpected error:', error);
        await navigateTo('/');
      }
    
    }
  }
}

async function handleSubmit() {
  if (!userStore.user) {
    return;
  }
  addUserTag({id: userStore.user.id, tags: tags.value as tagData[]});
  await registrationStore.fetchRegistrationStatus(userStore.user?.email)
  return navigateTo('/student/dashboard');
}


const fetchAlldata = async () =>{ 
  DbTags.value = await getTags();
}

</script>
