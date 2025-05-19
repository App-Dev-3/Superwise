<template>
  <div class="flex flex-col items-center px-2 max-w-full">
      <div class="min-h-screen flex flex-col max-w-7xl w-full">
        <div class="fixed top-0 z-10 left-0 right-0 ">
          <AppHeader show-search show-user />
        </div>
          <div class="mt-36 mb-16 flex flex-col items-center justify-center w-full">
            <SwipeContainer
                v-for="(supervisor, index) in recommendedSupervisors"
                :key="supervisor.supervisor_userId || index"
                :ref="el => setItemRef(el, supervisor.supervisor_userId)"
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
                @button-click="handleToastClick()"
                @close="toast.visible = false"
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
      <ConfirmationModal
        v-if="modalInformation && !settingsStore.settings?.dismissConfirmationModal"
        linked-component-id="confirmationModal"
        :headline="modalInformation.headline"
        :icon="modalInformation.icon"
        image="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
        :description="modalInformation.description"
        :confirm-button-text="modalInformation.confirmButtonText"
        :confirm-button-color="modalInformation.confirmButtonColor"
        @confirm="handleModalConfirm(modalInformation.supervisor)"
        @abort="handleModalAbort(modalInformation.supervisor)"
        @dontShowAgain="handleModalDontShowAgain"
        />
  </div>
</template>

<script setup lang="ts">

import { useSupervisorStore } from '~/stores/useSupervisorStore'
import { useSettingsStore } from '~/stores/useSettingsStore'
import { computed, nextTick, onMounted, ref } from 'vue';
import type { SupervisorData } from "~/shared/types/supervisorInterfaces"
import { type SupervisionRequestData, type ConfirmationDialogData, type SupervisionRequestResponseData, supervisionRequestStatus } from "~/shared/types/userInterfaces"
import type { SwipeContainer } from '#components';


const { makeSupervisionRequest, createStudentProfile } = useUserApi();
const supervisorStore = useSupervisorStore();
const userStore = useUserStore();
const settingsStore = useSettingsStore();

const swipeContainerRefs = ref<Record<string, InstanceType<typeof SwipeContainer> | null>>({})
const modalInformation = ref<ConfirmationDialogData | null>(null)
let supervisionRequestReturnData = ref<SupervisionRequestResponseData | null>(null);
const removedSupervisor = ref<SupervisorData | null>(null);
const toast = ref({
    visible: false,
    type: "success",
    message: "This is a toast message",
});

console.log("Supervisor data:", supervisorStore.supervisors);
const recommendedSupervisors = computed(() => {
    return supervisorStore.supervisors
      .sort((a, b) => {
          return b.compatibilityScore - a.compatibilityScore;
      })
});


const handleSwipeRight = (supervisor: SupervisorData) => {
    modalInformation.value = {
      type: 'confirm',
      headline: `Request ${supervisor.firstName} ${supervisor.lastName}`,
      icon: '',
      warning: '',
      description: `You’re about to request supervision from ${supervisor.firstName} ${supervisor.lastName}. Proceed?`,
      confirmButtonText: 'Send Request',
      confirmButtonColor: 'primary',
      supervisor: supervisor
    };
    removedSupervisor.value = supervisor; 
    openModal(supervisor.supervisor_userId);
};

const handleSwipeLeft = async(supervisor: SupervisorData) => {
    modalInformation.value = {
      type: 'dismiss',
      headline: `Dismiss Supervisor`,
      icon: 'ban',
      warning: 'Dismissed supervisors can still be found in the search',
      description: `By dismissing ${supervisor.firstName} ${supervisor.lastName}, they will never get suggested again. Are you sure you want to do this?`,
      confirmButtonText: 'Dismiss Supervisor',
      confirmButtonColor: 'error',
      supervisor: supervisor

    };
    removedSupervisor.value = supervisor;
    openModal(supervisor.supervisor_userId);
};


const handleToastClick = async() => {
  toast.value.visible = false;
  if (removedSupervisor.value) {
    supervisorStore.addSupervisor(removedSupervisor.value);
  }
  if (!supervisionRequestReturnData.value) return;

  if (modalInformation.value?.type === 'confirm') {
    console.log("Undoing request for supervisor:", supervisionRequestReturnData.value);
    const {error} = await useFetch(`api/supervision-requests/${supervisionRequestReturnData.value?.id}`, {
      method: 'PATCH',
      body: {
        request_state: supervisionRequestStatus.WITHDRAWN,
      },
    });
    console.log("Undo request error:", error);
  }
};

const handleModalConfirm = async (supervisor: SupervisorData) => {
  if (modalInformation.value?.type === 'confirm') {
    supervisionRequestReturnData.value = await makeSupervisionRequest({
      supervisor_id: supervisor.supervisorId,
    } as SupervisionRequestData);
    toast.value = {
      visible: true,
      type: "success",
      message: "Chat request has been sent",
    };
  } else if (modalInformation.value?.type === 'dismiss') {
    await useFetch(`/api/users/${userStore.user?.id}/blocks`, {
      method: 'POST',
      body: {
        blocked_id: supervisor.supervisor_userId,
      },
    });
    toast.value = {
      visible: true,
      type: "error",
      message: "Supervisor has been dismissed",
    };
  }
  supervisorStore.removeSupervisor(supervisor.supervisor_userId);
  
  console.log("Confirmed request for supervisor:", supervisionRequestReturnData.value);
};

const handleModalAbort = (supervisor: SupervisorData) => {
  const ref = swipeContainerRefs.value[supervisor.supervisor_userId]
  ref?.reset?.()
};

const handleModalDontShowAgain = () => {
  settingsStore.setSettings({
    ...settingsStore.settings,
    dismissConfirmationModal: true
  });
};
const openModal = async (id: string) => {
  await nextTick();
  const modal = document.getElementById('confirmationModal') as HTMLDialogElement
  modal?.showModal()
}

const setItemRef = (el: InstanceType<typeof SwipeContainer> | null, id: string) => {
  if (el) {
    swipeContainerRefs.value[id] = el
  } else {
    delete swipeContainerRefs.value[id]
  }
}

function navigate(route: string) {
    dummyRoute.value = route;
    navigateTo(route);
}

const dummyRoute = ref("/");

</script>