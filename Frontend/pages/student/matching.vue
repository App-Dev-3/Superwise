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
                @button-click="handleToastUndoClick()"
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
        @confirm="handleActionConfirmation(modalInformation.supervisor)"
        @abort="handleActionResetSwipe(modalInformation.supervisor)"
        @dontShowAgain="handleModalDontShowAgain"
        />
  </div>
</template>

<script setup lang="ts">

import { useSupervisorStore } from '~/stores/useSupervisorStore'
import { useSettingsStore } from '~/stores/useSettingsStore'
import { computed, nextTick, onMounted, ref } from 'vue';
import type { SupervisorData } from "~/shared/types/supervisorInterfaces"
import { 
  type ConfirmationDialogData, 
  type SupervisionRequestResponseData, 
  supervisionRequestStatus, 
  supervisionRequestType 
} from "~/shared/types/userInterfaces"
import type { SwipeContainer } from '#components';


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

const recommendedSupervisors = computed(() => {
    return supervisorStore.supervisors
      .sort((a, b) => {
          return b.compatibilityScore - a.compatibilityScore;
      })
});

const handleSwipeRight = (supervisor: SupervisorData) => {
  removedSupervisor.value = supervisor;
    modalInformation.value = {
      type: supervisionRequestType.CONFIRM,
      headline: `Request ${supervisor.firstName} ${supervisor.lastName}`,
      icon: '',
      warning: '',
      description: `You’re about to request supervision from ${supervisor.firstName} ${supervisor.lastName}. Proceed?`,
      confirmButtonText: 'Send Request',
      confirmButtonColor: 'primary',
      supervisor: supervisor
    };

    if (!settingsStore.settings?.dismissConfirmationModal) {
      openModal(supervisor.supervisor_userId);
    } else {
      handleActionConfirmation(supervisor);
      showToastInformation('success');
    }
};

const handleSwipeLeft = async(supervisor: SupervisorData) => {
  removedSupervisor.value = supervisor;
    modalInformation.value = {
      type: supervisionRequestType.DISMISS,
      headline: `Dismiss Supervisor`,
      icon: 'ban',
      warning: 'Dismissed supervisors can still be found in the search',
      description: `By dismissing ${supervisor.firstName} ${supervisor.lastName}, they will never get suggested again. Are you sure you want to do this?`,
      confirmButtonText: 'Dismiss Supervisor',
      confirmButtonColor: 'error',
      supervisor: supervisor
    };

    if (!settingsStore.settings?.dismissConfirmationModal) {
      openModal(supervisor.supervisor_userId);
    } else {
      handleActionConfirmation(supervisor);
      showToastInformation('error');
    }
};


const handleToastUndoClick = async() => {
  toast.value.visible = false;
  if (removedSupervisor.value) {
    supervisorStore.addSupervisor(removedSupervisor.value);
    handleActionResetSwipe(removedSupervisor.value);
  }

  if (modalInformation.value?.type === supervisionRequestType.CONFIRM) {
    const {error} = await useFetch(`api/supervision-requests/${supervisionRequestReturnData.value?.id}`, {
      method: 'PATCH',
      body: {
        request_state: supervisionRequestStatus.WITHDRAWN,
      },
    });
  } else if (modalInformation.value?.type === supervisionRequestType.DISMISS) {
    if (!removedSupervisor.value) return;
    const {error} = await useFetch(`api/users/${userStore.user?.id}/blocks/${removedSupervisor.value.supervisor_userId}`, {
      method: 'DELETE',
    });
  }
};

const handleActionConfirmation = async (supervisor: SupervisorData) => {
  if (modalInformation.value?.type === supervisionRequestType.CONFIRM) {
    const { data } = await useFetch<SupervisionRequestResponseData>(`api/supervision-requests`, {
      method: 'POST',
      body: {
        supervisor_id: supervisor.supervisorId,
      },
    });
    supervisionRequestReturnData.value = data.value;
    showToastInformation(supervisionRequestType.CONFIRM);
  } else if (modalInformation.value?.type === supervisionRequestType.DISMISS) {
    await useFetch(`/api/users/${userStore.user?.id}/blocks`, {
      method: 'POST',
      body: {
        blocked_id: supervisor.supervisor_userId,
      },
    });
    showToastInformation(supervisionRequestType.DISMISS);
  }
  supervisorStore.removeSupervisor(supervisor.supervisor_userId);
};

const handleActionResetSwipe = (supervisor: SupervisorData) => {
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

const showToastInformation = (type: string) => {
  if (type === supervisionRequestType.CONFIRM) {
    toast.value = {
      visible: true,
      type: "success",
      message: "Supervision request has been sent",
    };
  } else if (type === supervisionRequestType.DISMISS) {
    toast.value = {
      visible: true,
      type: "error",
      message: "Supervisor has been dismissed",
    };
  }
};

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