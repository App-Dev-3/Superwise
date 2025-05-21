<template>
  <div class="flex flex-col items-center px-2 max-w-full">
      <div class="min-h-screen flex flex-col max-w-7xl w-full">
        <div class="fixed top-0 z-10 left-0 right-0 ">
            <!-- Is this the header thats supposed to be used??-->
            <AdminHeader 
                header-text="Matching" 
                variant="default" 
            />
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
                :image="supervisor.profile_image || getPlaceholderImage(supervisor.firstName, supervisor.lastName)"
                :description="supervisor.bio"
              />
            </SwipeContainer>
          </div>
          
          <div class="">
            <BottomNav
                :bottom-nav-buttons="bottomNavButtons"
                :always-show-labels="false"
                @navigate="navigate"
            />
          </div>
      </div>
      <Toast
        v-if="toast.visible"
        :type="toast.type"
        :message="toast.message"
        :duration="3000"
        button-text="Undo"
        @button-click="handleToastUndoClick"
        @close="handleToastClosed"
      />
      <ConfirmationModal
        v-if="modalInformation && !settingsStore.settings?.dismissConfirmationModal"
        linked-component-id="confirmationModal"
        :headline="modalInformation.headline"
        :icon="modalInformation.icon"
        image="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
        :description="modalInformation.description"
        :confirm-button-text="modalInformation.confirmButtonText"
        :confirm-button-color="modalInformation.confirmButtonColor"
        @confirm="showToastInformation(modalInformation.type)"
        @abort="handleActionResetSwipe(modalInformation.supervisor)"
        @dont-show-again="handleModalDontShowAgain"
        />
  </div>
</template>

<script setup lang="ts">


import { useSupervisorStore } from '~/stores/useSupervisorStore'
import { useSettingsStore } from '~/stores/useSettingsStore'
import { computed, nextTick, ref } from 'vue';
import type { SupervisorData } from "~/shared/types/supervisorInterfaces"
import type { 
  ConfirmationDialogData, 
  SupervisionRequestResponseData, 
} from "~/shared/types/userInterfaces"
import {
  HttpMethods,
  supervisionRequestType 
} from "~/shared/enums/enums"
import type { SwipeContainer } from '#components';
const bottomNavButtons = [
    { label: 'Dashboard', icon: 'house', route: '/student/dashboard' },
    { label: 'Matching', icon: 'user-group', route: '/student/matching' },
    { label: 'Chat', icon: 'message', route: '/student/chat' }
]

const supervisorStore = useSupervisorStore();
const userStore = useUserStore();
const settingsStore = useSettingsStore();

const swipeContainerRefs = ref<Record<string, InstanceType<typeof SwipeContainer> | null>>({})
const modalInformation = ref<ConfirmationDialogData | null>(null)
const supervisionRequestReturnData = ref<SupervisionRequestResponseData | null>(null);
const removedSupervisor = ref<SupervisorData | null>(null);
const toast = ref({
    visible: false,
    type: "success",
    message: "This is a toast message",
});

if (!supervisorStore.supervisors || supervisorStore.supervisors.length === 0) {
    const {data, error} = await  useFetch(`/api/match/${userStore.user?.id}`, {
      method: HttpMethods.GET,
    });
    if(error.value){ 
      console.error("Error fetching supervisors:", error.value);
      navigate('/student/dashboard');
    } else {
      supervisorStore.setSupervisors(data.value);
    }
  }

const recommendedSupervisors = computed(() => {
  return [...supervisorStore.supervisors]
    .sort((a, b) => {
        return b.compatibilityScore - a.compatibilityScore;
    })
});

const handleSwipeRight = (supervisor: SupervisorData) => {
  // quickest solution in the wild west for the bug where spamming the slider wont send old requests
  if (toast.value.visible) {
    handleToastClosed();
  }
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
    openModal();
  } else {
    supervisorStore.removeSupervisor(supervisor.supervisor_userId);
    showToastInformation(supervisionRequestType.CONFIRM);
  }
};

const handleSwipeLeft = async(supervisor: SupervisorData) => {
  if (toast.value.visible) {
    handleToastClosed();
  }
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
    openModal();
  } else {
    supervisorStore.removeSupervisor(supervisor.supervisor_userId);
    showToastInformation(supervisionRequestType.DISMISS);
  }
};

const handleToastUndoClick = async() => {
  toast.value.visible = false;
  if (removedSupervisor.value) {
    supervisorStore.addSupervisor(removedSupervisor.value);
    handleActionResetSwipe(removedSupervisor.value);
  }
};

/**
 * This function is called when the toast is closed.
 * It is vital for the functionality of the matching. When the toast closes, the appropriate
 * request is sent to perform the user action.
 * 
 * Its implemented this way to reduce the amount of request calls in case the user 'undoes' the action.
 */
const handleToastClosed = () => {
  console.log('closing toast for: ' ,modalInformation.value?.supervisor?.firstName);
  toast.value.visible = false;
  if (modalInformation.value?.supervisor) {
    handleActionConfirmation(modalInformation.value.supervisor);
  }
};

const handleActionConfirmation = async (supervisor: SupervisorData) => {
  if (modalInformation.value?.type === supervisionRequestType.CONFIRM) {
    const { data } = await useFetch<SupervisionRequestResponseData>(`/api/supervision-requests`, {
      method: HttpMethods.POST,
      body: {
        supervisor_id: supervisor.supervisorId,
      },
    });
    supervisionRequestReturnData.value = data.value;
  } else if (modalInformation.value?.type === supervisionRequestType.DISMISS) {
    await useFetch(`/api/users/${userStore.user?.id}/blocks`, {
      method: HttpMethods.POST,
      body: {
        blocked_id: supervisor.supervisor_userId,
      },
    });
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
const openModal = async () => {
  await nextTick();
  const modal = document.getElementById('confirmationModal') as HTMLDialogElement
  modal?.showModal()
}

const showToastInformation = (type: string) => {
  if (modalInformation.value?.supervisor?.supervisor_userId) {
      supervisorStore.removeSupervisor(modalInformation.value?.supervisor?.supervisor_userId);
  }
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
  }
}

function navigate(route: string) {
    dummyRoute.value = route;
    navigateTo(route);
}

const dummyRoute = ref("/");

</script>