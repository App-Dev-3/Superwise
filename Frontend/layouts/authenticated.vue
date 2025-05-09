<template>
  <div class="w-full h-screen flex max-w-3xl m-auto flex-col">
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>

    <SignedIn>
      <div v-if="!isLoaded">Loading…</div>
      <!-- Once loaded and redirect logic is done, render the page slot -->
      <div v-else>
        <slot />
      </div>
    </SignedIn>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { until } from '@vueuse/core'
import { useRouter, useRoute } from "vue-router";
import type { UserData } from "~/shared/types/userInterfaces";

const router = useRouter();
const route = useRoute();
const { user, isLoaded } = useUser();
const { getUserByEmail } = useUserApi();

const onboardingRoutes = ["/onboarding/student", "/onboarding/supervisor"];

// track whether we've already kicked off a redirect, so we don't flash content
const redirecting = ref(false);

const CheckStatus = async () => {

  redirecting.value = true;
  await until(isLoaded).toBe(true);

  const onboardingComplete = user.value?.unsafeMetadata.onboardingCompleted;
  let userRole = "student"; // default to student
  if (user.value?.primaryEmailAddress?.emailAddress) {
    try {
      const res = await getUserByEmail(user.value?.primaryEmailAddress.emailAddress) as UserData;
      userRole = res.role;
    } catch (error) {
      console.error("Error getting user role:", error);
    }
  }

  if (userRole === 'admin') {
    // admins should go to the admin dashboard
    //Unique layout for admin to ensure security
    await router.replace("/admin/dashboard");
    return;
  }

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
};
CheckStatus()
</script>
