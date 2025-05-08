<template>
  <div class="flex flex-col items-center px-2 max-w-full">
    <div class="min-h-screen flex flex-col max-w-7xl w-full">
      <AppHeader show-search show-user />
      <StatusBar :step="1" class="mt-4" />
      <div class="my-auto mx-auto max-w-7xl w-full p-12">
        <ActionCard button-text="Start Matching!" card-type="primary">
          <div class="flex flex-col w-full items-center p-3">
            <CardStack :amount="matches.length">
              <SupervisorCard
                size="lg"
                :tags="matches[0].tags"
                :current-capacity="matches[0].availableSpots"
                :max-capacity="matches[0].totalSpots"
                :similarity-score="matches[0].compatibilityScore"
                name="Hello name"
                image="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                :description="matches[0].bio"
              />
            </CardStack>
          </div>
        </ActionCard>
      </div>

      <div class="max-w-7xl w-full">
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
import BottomNav from "../components/BottomNav/BottomNav.vue";
import AppHeader from "../components/AppHeader/AppHeader.vue";
import StatusBar from "../components/StatusBar/StatusBar.vue";
import ActionCard from "../components/ActionCard/ActionCard.vue";
import { useUserStore } from "~/stores/useUserStore";
import type { UserData } from "~/shared/types/userInterfaces";

definePageMeta({
  layout: "authenticated",
});

const { user, isLoaded } = useUser();
const { getUserByEmail, getMatches, getUserById } = useUserApi();
const userStore = useUserStore();

type Matches = Awaited<ReturnType<typeof getMatches>>;
let matches = ref<Matches>([] as Matches);

let current_user: UserData | null = userStore.user;

if (!current_user && user.value?.primaryEmailAddress?.emailAddress) {
  let res = (await getUserByEmail(
    user.value?.primaryEmailAddress.emailAddress
  )) as UserData;
  userStore.setUser(res);

  current_user = res;
}

if (current_user !== null) {
  matches = await getMatches(current_user.id);
  console.log(matches);
} else console.log("noooooooooooooooooooooooooooooooooo");

function navigate(route) {
  dummyRoute.value = route;
  console.log("Navigating to:", route);
}

const dummyRoute = ref("/");
</script>
