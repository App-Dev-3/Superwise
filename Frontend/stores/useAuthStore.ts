import type { UserResource } from "@clerk/types";
import { until } from "@vueuse/core";

export const useAuthStore = defineStore('auth', () => {
    const user = ref<UserResource | null | undefined>(undefined);
    const isLoaded = ref(false);
    const isSignedIn = ref<boolean | undefined>(undefined);
    const isInitialized = ref(false);

    const initialize = async () => {
        if (import.meta.server || isInitialized.value) return;

        const { user: clerkUser, isLoaded: clerkIsLoaded, isSignedIn: clerkIsSignedIn } = useUser();

        if (!clerkIsLoaded.value) {
            await until(clerkIsLoaded).toBe(true);
        }

        watch(clerkUser, (newVal) => {
            user.value = newVal;
        }, { immediate: true });

        watch(clerkIsLoaded, (newVal) => {
            isLoaded.value = newVal;
        }, { immediate: true });

        watch(clerkIsSignedIn, (newVal) => {
            isSignedIn.value = newVal;
        }, { immediate: true });

        isInitialized.value = true;
    };

    return {
        user,
        isLoaded,
        isSignedIn,
        initialize
    };
});