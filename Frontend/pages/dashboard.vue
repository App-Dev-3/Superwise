<template>
    <div class="flex flex-col items-center px-2 max-w-full">
        <div class="min-h-screen flex flex-col max-w-7xl w-full">
            <AppHeader show-search show-user />
            <StatusBar :step="1" class="mt-4" />
            <div class="my-auto mx-auto max-w-7xl w-full p-12">
                <ActionCard button-text="Start Matching!" card-type="primary">
                    <div class="flex flex-col w-full items-center p-3">
                        <h2 class="text-xl mx-4 py-8">Find your supervisor now!</h2>
                        <CardStack :amount="matches.length">
                            <SupervisorCard
                                size="lg"
                                :first-name="matches[0].firstName"
                                :last-name="matches[0].lastName"
                                :tags="matches[0].tags"
                                :current-capacity="matches[0].availableSpots"
                                :max-capacity="matches[0].totalSpots"
                                :similarity-score="Math.round(matches[0].compatibilityScore * 100)"
                                name="Hello name"
                                image="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                                :description="matches[0].bio"
                            />
                        </CardStack>
                    </div>
                </ActionCard>
            </div>

            <div class="">
                <BottomNav
                    :active-route="dummyRoute"
                    :always-show-labels="false"
                    @navigate="navigate"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "~/stores/useUserStore";
import { useSupervisorStore } from "~/stores/useSupervisorStore";
import type { UserData } from "~/shared/types/userInterfaces";
import type { SupervisorData } from "~/shared/types/supervisorInterfaces";

definePageMeta({
    layout: "authenticated",
});

const { user } = useUser();
const { getUserByEmail, getMatches} = useUserApi();
const userStore = useUserStore();
const supervisorStore = useSupervisorStore();

const matches = ref([] as SupervisorData[]);

if (!userStore.user && user.value?.primaryEmailAddress?.emailAddress) {
    const res = (await getUserByEmail(
        user.value?.primaryEmailAddress.emailAddress
    )) as UserData;
    userStore.setUser(res);

}

if (userStore.user !== null) {
  const res = await getMatches(userStore.user.id) as SupervisorData[];
  supervisorStore.setSupervisors(res);
  matches.value = res;
  console.log('matches', matches.value);
}

function navigate(route: string) {
    dummyRoute.value = route;
    console.log("Navigating to:", route);
}

const dummyRoute = ref("/");
</script>
