import { until } from "@vueuse/core";
import type { UserData } from "~/shared/types/userInterfaces";


export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const { user, isLoaded, isSignedIn } = useUser()
  const registrationStore = useRegistrationStore()


  // Wait until user is loaded
  if (!isLoaded.value) await until(isLoaded).toBe(true)

  // Allow public access to root and login
  const publicPaths = ['/']

  if (!isSignedIn.value) {
    if (!publicPaths.includes(to.path)) {
      return navigateTo('/')
    }
    // If signed out and on a public page, skip the rest of the logic
    return
  }

  // Onboarding check
  const userEmail = user.value?.primaryEmailAddress?.emailAddress;
  await registrationStore.fetchRegistrationStatus(userEmail)
  
  const onboardingComplete = registrationStore.status?.is_registered

  if (!onboardingComplete && !to.path.startsWith('/onboarding')) {
    return navigateTo('/onboarding/onboarding')
  }

  if (onboardingComplete && to.path.startsWith('/onboarding')) {
    return navigateTo('/dashboard')
  }

  // Redirect signed-in users away from root
  if (to.path === '/') {
    return navigateTo('/dashboard')
  }
})

