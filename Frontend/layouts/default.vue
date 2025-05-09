<template>
    <div class="w-full h-screen flex max-w-3xl m-auto flex-col">
        <SignedOut>
            <slot/>
        </SignedOut>

        <SignedIn>
            <slot/>
        </SignedIn>
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
