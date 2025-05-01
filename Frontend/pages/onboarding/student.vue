<template>
<<<<<<< HEAD
  <div>
<<<<<<< HEAD
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>
    <SignedIn>
      <div class="flex flex-col items-center justify-center h-screen p-4">
        <h1 class="text-2xl font-semibold mb-6">
          Welcome to student onboarding
        </h1>
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
  </div>
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
=======
    <header>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div v-if="!isLoaded">Loading...</div>
=======
  <SignedOut>
    <RedirectToSignIn />
  </SignedOut>
  <SignedIn>
    <div class="flex flex-col items-center justify-center h-screen p-4">
      <h1 class="text-2xl font-semibold mb-6">Welcome to student onboarding</h1>
      <span v-if="!isLoaded">Loading...</span>
>>>>>>> eb19750 (major pwa update, added typescript as a dependency, added layouts and clerk onboarding and consisten auth)

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
</template>

<script setup>
import { useUser } from "@clerk/vue";

definePageMeta({
  layout: "default",
});

<<<<<<< HEAD
const { user, isLoaded } = useUser();
>>>>>>> bc702a0 (added auth and onboarding middleware)
=======
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
>>>>>>> eb19750 (major pwa update, added typescript as a dependency, added layouts and clerk onboarding and consisten auth)
</script>
