<template>
  <div class="flex flex-col items-center px-2 max-w-full">
      <div class="min-h-screen flex flex-col max-w-7xl w-full">
        <div class="fixed top-0 z-10 left-0 right-0 ">
          <AppHeader show-search show-user />
          <StatusBar :step="2" class="pb-4 bg-base-100" />
        </div>
          <div class="mt-36 mb-16 flex flex-col items-center justify-center w-full">
            <SwipeContainer
                v-for="(supervisor, index) in supervisorStore.supervisors"
                :key="supervisor.supervisor_userId || index"
                @swipeLeft="handleSwipeLeft"
                @swipeRight="handleSwipeRight"
                class="mb-4"
            >
              <SupervisorCard
                size="xl"
                :first-name="supervisorStore.supervisors[0].firstName"
                :last-name="supervisorStore.supervisors[0].lastName"
                :tags="supervisorStore.supervisors[0].tags"
                :current-capacity="supervisorStore.supervisors[0].availableSpots"
                :max-capacity="supervisorStore.supervisors[0].totalSpots"
                :similarity-score="Math.round(supervisorStore.supervisors[0].compatibilityScore * 100)"
                image="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                :description="supervisorStore.supervisors[0].bio"
              />


            </SwipeContainer>
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

import { useUserStore } from '~/stores/useUserStore'
import { useSupervisorStore } from '~/stores/useSupervisorStore'
import { ref } from 'vue';

definePageMeta({
    layout: "authenticated",
});

const userStore = useUserStore();
const supervisorStore = useSupervisorStore();

console.log('userStore', userStore.user);
console.log('supervisorStore', supervisorStore.supervisors);

const handleSwipeLeft = () => {
    console.log("Swiped left!");
    // Handle the left swipe action here
};
const handleSwipeRight = () => {
    console.log("Swiped right!");
    // Handle the right swipe action here
};




function navigate(route: string) {
    dummyRoute.value = route;
    navigateTo(route);
    console.log("Navigating to:", route);
}

const dummyRoute = ref("/");

</script>