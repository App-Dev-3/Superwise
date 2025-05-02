<template>
  <<<<<<< HEAD
  <SignedOut>
    <RedirectToSignIn />
  </SignedOut>
  <SignedIn>
    <div class="flex flex-col items-center justify-center h-screen p-4">
      <h1 class="text-2xl font-semibold mb-6">Welcome to student onboarding</h1>
      <span v-if="!isLoaded">Loading...</span>

      <button
        v-else
        class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        :disabled="!isLoaded"
        @click="finishOnboarding"
      >
        <span>Finish onboarding</span>
      </button>
    </div>
  </SignedIn>
  =======
  <div class="flex flex-col items-center justify-center h-screen p-4">
    <h1 class="text-2xl font-semibold mb-6">Welcome to Onboarding</h1>
    <span v-if="!isLoaded">Loading...</span>

    <button
      v-else
      class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      :disabled="!isLoaded"
      @click="finishOnboarding"
    >
      <span>Finish onboarding</span>
    </button>
  </div>
  >>>>>>> 439f63f2042719521c9c050e8eb3223cb104b1a2
</template>

<script setup lang="ts">
import { useUser } from "@clerk/nuxt/composables";
import { navigateTo } from "nuxt/app";

definePageMeta({
  layout: "default",
});

const { isLoaded, isSignedIn, user } = useUser();

const finishOnboarding = async () => {
  if (!isLoaded.value || !isSignedIn.value || !user.value) return;

  try {
    await user.value.update({ unsafeMetadata: { onboardingCompleted: true } });

    return navigateTo(`/dashboard`);
  } catch (err) {
    console.error("Onboarding error:", err);
  }
};
</script>
