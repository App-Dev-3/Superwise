<template>
  <div>
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>

    <SignedIn>
      <UserButton />

      <div v-if="!isLoaded">Loading…</div>

      <!-- Once loaded and redirect logic is done, render the page slot -->
      <div v-else>
        <slot />
      </div>
    </SignedIn>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const { user, isLoaded } = useUser();

const onboardingRoutes = ["/onboarding/student", "/onboarding/supervisor"];

// track whether we've already kicked off a redirect, so we don't flash content
const redirecting = ref(false);

watch(isLoaded, async (loaded) => {
  if (!loaded || redirecting.value) return;

  redirecting.value = true;

  const onboardingComplete = user.value?.unsafeMetadata.onboardingCompleted;
  const userRole = user.value?.unsafeMetadata.role || "student"; //get from nestjs
  const isOnboardingPage = onboardingRoutes.some((p) =>
    route.path.startsWith(p)
  );

  if (!onboardingComplete && !isOnboardingPage) {
    // not onboarded yet → onboarding

    await router.replace(`/onboarding/${userRole}`);
    return;
  }

  if (onboardingComplete && isOnboardingPage) {
    // already onboarded but on an onboarding page → send them to dashboard
    await router.replace("/dashboard");
    return;
  }

  // neither redirect condition matched, so we'll let the slot render
});
</script>
