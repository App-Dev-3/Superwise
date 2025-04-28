// ~/middleware/auth.global.ts
import { useAuth } from "@clerk/nuxt/composables";
import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";

const publicPaths = [
    "/",
    "/test",
    "/another",
    "/sign-in",
    "/sign-up",
    "/__clerk"
]


export default defineNuxtRouteMiddleware((to) => {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded.value) {
        return;
    }

    if (publicPaths.includes(to.path)) {
        return;
    }

    if (!isSignedIn.value) {
        return navigateTo("/sign-in");
    }
});
