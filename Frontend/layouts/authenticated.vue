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
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { UserData } from "~/shared/types/userInterfaces";

const router = useRouter();
const route = useRoute();
const { user, isLoaded } = useUser();
const { getUserByEmail } = useUserApi();

const onboardingRoutes = ["/onboarding/student", "/onboarding/supervisor"];
onMounted(() => {
  checkLogged();
});
// track whether we've already kicked off a redirect, so we don't flash content
const redirecting = ref(false);
const checkLogged = async () => {
  if (!isLoaded || redirecting.value) return;

  redirecting.value = true;

  const onboardingComplete = user.value?.unsafeMetadata.onboardingCompleted;
  let userRole = "STUDENT"; // default to student
  if (user.value?.primaryEmailAddress?.emailAddress) {
    const res = (await getUserByEmail(
      user.value?.primaryEmailAddress.emailAddress
    )) as UserData;
    userRole = res.role;
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
</script>
