import { useUser } from "@clerk/nuxt/composables";
import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { until } from '@vueuse/core'

export default defineNuxtRouteMiddleware(async (to) => {
    const { isLoaded, isSignedIn, user } = useUser();

    await until(isLoaded).toBe(true)

    if (isSignedIn.value && user.value) {
        if (user.value.unsafeMetadata.onboardingComplete === true) return;

        // Get role from nest backend?
        const role = user.value.unsafeMetadata.role || "student";
        return navigateTo(`/onboarding/${role}`);
    }

})
