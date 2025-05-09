<template>
    <div class="w-full h-screen flex max-w-3xl m-auto flex-col">
      <SignedOut> 
        <slot v-if="isUserSigned"/>
      </SignedOut>
    </div>
</template>

<script setup lang="ts">
import { until } from '@vueuse/core';

const { isSignedIn, isLoaded } = useUser();

console.log("User is signed in:", isSignedIn.value);
const CheckUserStatus = async () => {
  await until(isLoaded).toBe(true);
  if (isSignedIn.value) {
    navigateTo("/dashboard");
  }
}
const isUserSigned = async () => {
  await until(isLoaded).toBe(true);
  return isSignedIn.value;
}
CheckUserStatus();
</script>
