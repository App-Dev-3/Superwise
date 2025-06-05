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
            console.log('🍍🍍🍍🍍🍍🍍[AUTH STORE]: Waiting for Clerk to be loaded...⌚⌚')
            await until(clerkIsLoaded).toBe(true);
            console.log('🍍🍍🍍🍍🍍🍍[AUTH STORE]: Clerk is loaded!✅✅');
        }

        watch(clerkUser, (newVal) => {
            user.value = newVal;
            if (newVal) {
                console.log('🍍🍍🍍🍍🍍🍍[AUTH STORE]: User data is available!✅✅');
            } else {
                console.log('🍍🍍🍍🍍🍍🍍[AUTH STORE]: User data is not available!❌❌');
            }
        }, { immediate: true });

        watch(clerkIsLoaded, (newVal) => {
            isLoaded.value = newVal;
            if (newVal) {
                console.log('🍍🍍🍍🍍🍍🍍[AUTH STORE]: Clerk is still loaded!✅✅');
            } else {
                console.log('🍍🍍🍍🍍🍍🍍[AUTH STORE]: Clerk is not loaded anymore!❌❌');
            }
        }, { immediate: true });

        watch(clerkIsSignedIn, (newVal) => {
            isSignedIn.value = newVal;
            if (newVal) {
                console.log('🍍🍍🍍🍍🍍🍍[AUTH STORE]: User is signed in!✅✅');
            } else {
                console.log('🍍🍍🍍🍍🍍🍍[AUTH STORE]: User is signed out!❌❌');
            }
        }, { immediate: true });

        isInitialized.value = true;
        console.log('🍍🍍🍍🍍🍍🍍[AUTH STORE]: Auth store initialized!✅✅');
    };

    return {
        user,
        isLoaded,
        isSignedIn,
        initialize
    };
});