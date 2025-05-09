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
                class="mb-4"
                @swipe-left="handleSwipeLeft(supervisor)"
                @swipe-right="handleSwipeRight(supervisor)"
            >
              <SupervisorCard
                size="md"
                :first-name="supervisor.firstName"
                :last-name="supervisor.lastName"
                :tags="supervisor.tags"
                :current-capacity="supervisor.availableSpots"
                :max-capacity="supervisor.totalSpots"
                :similarity-score="Math.round(supervisor.compatibilityScore * 100)"
                image="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                :description="supervisor.bio"
              />
              <Toast
                v-if="toast.visible"
                :type="toast.type"
                :message="toast.message"
                :duration="3000"
                button-text="undo"
                @buttonClick="handleButtonClick()"
                @close="toast.visible = false"
              > </Toast>
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
import type { SupervisorData } from "~/shared/types/supervisorInterfaces"


definePageMeta({
    layout: "authenticated",
});

const userStore = useUserStore();
const supervisorStore = useSupervisorStore();

console.log('userStore', userStore.user);
console.log('supervisorStore', supervisorStore.supervisors);
const removedSupervisor = ref(null);
const toast = ref({
    visible: false,
    type: "success",
    message: "This is a toast message",
});

const handleSwipeLeft = (supervisor: SupervisorData) => {
    console.log("Swiped left!");
    toast.value = {
        visible: true,
        type: "error",
        message: "Supervisor has been dismissed",
    };
    removedSupervisor.value = supervisor;
    supervisorStore.removeSupervisor(supervisor.supervisor_userId);
    console.log("removed: ", supervisorStore.supervisors);


    // Handle the left swipe action here
};
const handleSwipeRight = (supervisor: SupervisorData) => {
    console.log("Swiped right!");
    toast.value = {
        visible: true,
        type: "success",
        message: "Chat request has been sent",
    };
    removedSupervisor.value = supervisor;
    supervisorStore.removeSupervisor(supervisor.supervisor_userId);
    // Handle the right swipe action here
};

const handleButtonClick = () => {
  toast.value.visible = false;
  supervisorStore.addSupervisor(removedSupervisor.value);
};



function navigate(route: string) {
    dummyRoute.value = route;
    navigateTo(route);
    console.log("Navigating to:", route);
}

const dummyRoute = ref("/");

</script>