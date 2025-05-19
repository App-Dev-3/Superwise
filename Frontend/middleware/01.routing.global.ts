import { until } from "@vueuse/core";
import {UserRoles} from "#shared/enums/enums";

export default defineNuxtRouteMiddleware(async (to) => {
  // ============ USER IS NOT AUTHENTICATED YET ============

  // Skip if middleware is running on the server
  if (import.meta.server) return

  const { user, isLoaded, isSignedIn } = useUser()
  const registrationStore = useRegistrationStore()
  const userStore = useUserStore()

  // Make sure clerkUser and backendUser are ready
  if (!isLoaded.value) await until(isLoaded).toBe(true)
  await userStore.refetchCurrentUser()

  // Only allow access to public paths if not signed in
  const publicPaths = ['/']

  if (!isSignedIn.value) {
    if (!publicPaths.includes(to.path)) {
      return navigateTo('/')
    }
    return
  }

  const userEmail = user.value?.primaryEmailAddress?.emailAddress;
  if (!userEmail) {
    return navigateTo('/')
  }
  // ============ USER IS NOW SIGNED IN ============

  // Register user if is not already registered

  await registrationStore.fetchRegistrationStatus(userEmail)
  let userRole = UserRoles.STUDENT
  if (registrationStore.status?.role) {
    userRole = registrationStore.status.role
  }
  const onboardingComplete = registrationStore.status?.is_registered

  if (!onboardingComplete && !to.path.startsWith('/onboarding')) {
    if (userRole === UserRoles.SUPERVISOR) {
      return navigateTo('/onboarding/supervisor')
    } else {
      return navigateTo('/onboarding/student')
    }
  }

  if (onboardingComplete && to.path.startsWith('/onboarding')) {
    return navigateTo(`/${userRole.toLowerCase()}/dashboard`)
  }

  // ============ USER IS NOW REGISTERED AND ONBOARDED ============

  // make sure only each role-specific route can only be accessed by the corresponding role
  if (
      !to.path.startsWith(`/${userRole.toLowerCase()}`)
      && !to.path.startsWith('/profiles')
  ) {
    return navigateTo(`/${userRole.toLowerCase()}/dashboard`)
  }

  // Redirect signed-in users away from the root
  if (to.path === '/') {
    if (userRole) {
      return navigateTo(`/${userRole.toLowerCase()}/dashboard`)
    }
  }
})

