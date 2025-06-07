<script lang="ts" setup>

import { ref } from "vue";
import type { UserData } from "#shared/types/userInterfaces";
import {UserRoles} from "#shared/enums/enums";


const userStore = useUserStore();
const currentUser = ref<UserData | null>(null);
if (!userStore.user) {
  await userStore.refetchCurrentUser();
}
currentUser.value = userStore.user;

if (userStore.user) {
  currentUser.value = userStore.user;
}

</script>

<template>
  <div class="w-full h-screen flex max-w-xl m-auto flex-col">
    <AppHeader
        :first-name="currentUser?.first_name || 'Admin'"
        :image="currentUser?.profile_image || ''"
        :last-name="currentUser?.last_name || 'Admin'"
        :role="UserRoles.ADMIN"
        show-search
        show-user
    />

    <div class="size-full overflow-y-auto flex flex-col">
      <slot/>
    </div>
  </div>
</template>