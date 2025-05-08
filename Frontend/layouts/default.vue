<template>
  <div>
    <SignedOut>
      <div>
        <SignInButton />
        <slot />
      </div>
    </SignedOut>
  </div>
</template>

<script setup lang="ts">
import { until } from '@vueuse/core';

const { isSignedIn } = useUser();

const CheckUserStatus = async () => {
  await until(isSignedIn).toBe(true);
  if (isSignedIn.value) {
    navigateTo("/dashboard");
  }
}

CheckUserStatus();
</script>
