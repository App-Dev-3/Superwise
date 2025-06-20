import { UserRoles } from "#shared/enums/enums";
import { until } from "@vueuse/core";

export default defineNuxtRouteMiddleware(async (to) => {
    // ============ USER IS NOT AUTHENTICATED YET ============

    // Skip if middleware is running on the server
    if (import.meta.server) return

    const authStore = useAuthStore()
    await authStore.initialize()
    const { user, isSignedIn, isLoaded } = storeToRefs(authStore)
    if (!isLoaded.value) {
        await until(isLoaded).toBe(true)
    }
    const registrationStore = useRegistrationStore()

    // Only allow access to public paths if not signed in
    const publicPaths = [ '/' ]

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

    if (!registrationStore.status || !registrationStore.status.exists || !registrationStore.status.is_registered) {
        await registrationStore.fetchRegistrationStatus(userEmail)
    }
    let userRole = UserRoles.STUDENT
    if (registrationStore.status?.role) {
        userRole = registrationStore.status.role
    }

    const accountRegistrationCompleted = registrationStore.status?.is_registered || false

    if (userRole === UserRoles.ADMIN) {
        if (!accountRegistrationCompleted) {
            if (!to.path.startsWith('/admin/app-tour')) {
                return navigateTo('/admin/app-tour')
            }
        }
        if (!to.path.startsWith('/admin') && !to.path.startsWith('/profiles')) {
            return navigateTo('/admin/dashboard')
        }
        return
    }

    const tagsSelected = registrationStore.status?.tags || false

    if (!accountRegistrationCompleted && to.path.startsWith('/onboarding')) {
        return
    }

    if (!accountRegistrationCompleted && !to.path.startsWith('/onboarding')) {
        if (userRole === UserRoles.SUPERVISOR) {
            return navigateTo('/onboarding/supervisor')
        } else {
            return navigateTo('/onboarding/student')
        }
    }
    if (
        accountRegistrationCompleted &&
        !tagsSelected
    ) {
        if (!to.path.startsWith(`/onboarding/${ userRole.toLowerCase() }`)) {
            return navigateTo(`/onboarding/${ userRole.toLowerCase() }`)
        }
        return
    }
    if (accountRegistrationCompleted && tagsSelected && to.path.startsWith('/onboarding')) {
        return navigateTo(`/${ userRole.toLowerCase() }/dashboard`)
    }

    // ============ USER IS NOW REGISTERED AND ONBOARDED ============

    // make sure only each role-specific route can only be accessed by the corresponding role
    if (
        !to.path.startsWith(`/${ userRole.toLowerCase() }`)
        && !to.path.startsWith('/profiles') && to.path !== '/playground'
    ) {
        return navigateTo(`/${ userRole.toLowerCase() }/dashboard`)
    }

    // Redirect signed-in users away from the root
    if (to.path === '/') {
        if (userRole) {
            return navigateTo(`/${ userRole.toLowerCase() }/dashboard`)
        }
    }
})

