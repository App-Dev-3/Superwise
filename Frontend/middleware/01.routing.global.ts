import { until } from "@vueuse/core";
import type { UserData } from "~/shared/types/userInterfaces";


export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return

  const { user, isLoaded, isSignedIn } = useUser();
  const { getUserByEmail } = useUserApi();

  
  if (!isLoaded.value) await until(isLoaded).toBe(true);

  if (!isSignedIn.value && to.path !== '/') {
    console.log('user not signed in', isSignedIn.value)
    return navigateTo('/')
  } else if (isSignedIn.value && to.path === '/') {
    return navigateTo('/dashboard')
  }

  const onboardingComplete = user.value?.unsafeMetadata.onboardingCompleted;
  
  if (!onboardingComplete && !to.path.startsWith('/onboarding/')) {
    console.log('onboarding not complete', onboardingComplete)
    return navigateTo('onboarding/onboarding');
  } else if (onboardingComplete && to.path.startsWith('/onboarding/')) {
    return navigateTo('/dashboard');
  }

})