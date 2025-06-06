<template>
  <div class="flex flex-col size-full items-center px-6 py-8 gap-8">
    <template v-if="!hasSupervisor">
      <SwipeContainer
          v-for="(supervisor, index) in recommendedSupervisors"
          :key="supervisor.supervisor_userId || index"
          :ref="el => setItemRef(el, supervisor.supervisor_userId)"
          class="mb-4"
          @swipe-left="handleSwipeLeft(supervisor)"
          @swipe-right="handleSwipeRight(supervisor)"
      >
        <SupervisorCard
            :current-capacity="supervisor.availableSpots"
            :description="supervisor.bio"
            :first-name="supervisor.firstName"
            :image="supervisor.profileImage || getPlaceholderImage(supervisor.firstName, supervisor.lastName)"
            :last-name="supervisor.lastName"
            :max-capacity="supervisor.totalSpots"
            :similarity-score="Math.round(supervisor.compatibilityScore * 100)"
            :tags="supervisor.tags"
            size="md"
        />
      </SwipeContainer>
      <div
          v-if="!recommendedSupervisors || recommendedSupervisors.length === 0"
          class="size-full flex flex-col justify-center items-center"
      >
        <EmptyPagePlaceholder
            :text="t('matching.noSupervisors')"
        />
      </div>
    </template>
    <template v-else>
      <ActionCard
          :button-text="t('matching.existingSupervision.actionButton')"
          :header-text="t('matching.existingSupervision.headline')"
          card-type="primary"
          @action-button-clicked="
                  navigate('/student/dashboard')
                "
      >
        <div class="h-96 flex">
          <div class="flex flex-col w-full items-center justify-center p-3">
            <Avatar
                :first-name="
                    acceptedSupervisionRequests?.supervisor.user.first_name || ''
                  "
                :last-name="
                    acceptedSupervisionRequests?.supervisor.user.last_name || ''
                  "
                :src="
                    acceptedSupervisionRequests?.supervisor.user.profile_image || ''
                  "
                alt="Profile Picture of {{ acceptedSupervisionRequests?.supervisor.user.first_name }} {{ acceptedSupervisionRequests?.supervisor.user.last_name }}"
                ring-color="success"
                shape="circle"
                size="xl"
            />
            <h2 class="text-xl mx-4 py-8 text-center">
              {{ acceptedSupervisionRequests?.supervisor.user.first_name }}
              {{ acceptedSupervisionRequests?.supervisor.user.last_name }}
              is your supervisor!
            </h2>
          </div>
        </div>
      </ActionCard>
    </template>
    <Toast
        v-if="toast.visible"
        :button-text="t('generic.undo')"
        :duration="3000"
        :message="toast.message"
        :type="toast.type"
        @close="handleToastClosed"
        @button-click="handleToastUndoClick"
    />
    <ConfirmationModal
        v-if="modalInformation"
        :confirm-button-color="modalInformation.confirmButtonColor"
        :confirm-button-text="modalInformation.confirmButtonText"
        :description="modalInformation.description"
        :headline="modalInformation.headline"
        :icon="modalInformation.icon"
        :image="modalInformation.supervisor?.profileImage"
        linked-component-id="confirmationModal"
        @abort="handleActionResetSwipe(modalInformation.supervisor)"
        @confirm="showToastInformation(modalInformation.type)"
        @dont-show-again="handleModalDontShowAgain(modalInformation.type)"
    />
  </div>
</template>

<script lang="ts" setup>


import { useSupervisorStore } from '~/stores/useSupervisorStore'
import { useSettingsStore } from '~/stores/useSettingsStore'
import { computed, nextTick, ref } from 'vue';
import type { SupervisorData } from "~/shared/types/supervisorInterfaces"
import type { ConfirmationDialogData, SupervisionRequestResponseData, } from "~/shared/types/userInterfaces"
import { HttpMethods, supervisionRequestType } from "~/shared/enums/enums"
import type { SwipeContainer } from '#components';
import type { SupervisionRequestsData } from "#shared/types/supervisorInterfaces";
import EmptyPagePlaceholder from "~/components/Placeholder/EmptyPagePlaceholder.vue";

const { t } = useI18n()

const bottomNavButtons = [
  { label: t('nav.dashboard'), icon: 'house', route: '/student/dashboard' },
  { label: t('nav.matching'), icon: 'user-group', route: '/student/matching' },
  { label: t('generic.requests'), icon: 'message', route: '/student/requests' }
]

const supervisorStore = useSupervisorStore();
const userStore = useUserStore();
const studentStore = useStudentStore();
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
const hasSupervisor = computed(() => {
  return studentStore.acceptedSupervisionRequests.length > 0;
});
const acceptedSupervisionRequests = ref<SupervisionRequestsData | null>(null)

onMounted(async () => {
  if (studentStore.acceptedSupervisionRequests[0] === undefined) {
    await studentStore.fetchSupervisionRequests()
  }
  acceptedSupervisionRequests.value = studentStore.acceptedSupervisionRequests[0];
});

if (!supervisorStore.supervisors || supervisorStore.supervisors.length === 0) {
  const { data, error } = await useFetch(`/api/match/${ userStore.user?.id }`, {
    method: HttpMethods.GET,
  });
  if (error.value) {
    console.error("Error fetching supervisors:", error.value);
    navigate('/student/dashboard');
  } else {
    supervisorStore.setSupervisors(data.value);
  }
}

const recommendedSupervisors = computed(() => {
  return [ ...supervisorStore.supervisors ]
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
    headline: `Request ${ supervisor.firstName } ${ supervisor.lastName }`,
    icon: '',
    warning: '',
    description: t('modal.supervisionInfo'),
    confirmButtonText: t('modal.confirm'),
    confirmButtonColor: 'primary',
    supervisor: supervisor
  };

  if (settingsStore.settings?.showSupervisionRequestModal) {
    openModal();
  } else {
    supervisorStore.removeSupervisor(supervisor.supervisor_userId);
    showToastInformation(supervisionRequestType.CONFIRM);
  }
};

const handleSwipeLeft = async (supervisor: SupervisorData) => {
  if (toast.value.visible) {
    handleToastClosed();
  }
  removedSupervisor.value = supervisor;
  modalInformation.value = {
    type: supervisionRequestType.DISMISS,
    headline: `Dismiss Supervisor`,
    icon: 'ban',
    warning: 'Dismissed supervisors can still be found in the search',
    description: `By dismissing ${ supervisor.firstName } ${ supervisor.lastName }, they will never get suggested again, but you can still search for them. Are you sure you want to do this?`,
    confirmButtonText: t('modal.confirm'),
    confirmButtonColor: 'error',
    supervisor: supervisor
  };

  if (settingsStore.settings?.showDismissModal) {
    openModal();
  } else {
    supervisorStore.removeSupervisor(supervisor.supervisor_userId);
    showToastInformation(supervisionRequestType.DISMISS);
  }
};

const handleToastUndoClick = async () => {
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
  console.log('closing toast for: ', modalInformation.value?.supervisor?.firstName);
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
    await useFetch(`/api/users/${ userStore.user?.id }/blocks`, {
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

const handleModalDontShowAgain = (type: supervisionRequestType) => {
  console.log("handleModalDontShowAgain called with type:", type);
  switch (type) {
    case supervisionRequestType.CONFIRM:
      settingsStore.setSettings({
        ...settingsStore.settings,
        showSupervisionRequestModal: false
      });
      break;
    case supervisionRequestType.DISMISS:
      settingsStore.setSettings({
        ...settingsStore.settings,
        showDismissModal: false
      });
      break;
    default:
      console.warn("Unknown type for handleModalDontShowAgain:", type);
  }
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


definePageMeta({
  layout: "student-base-layout",
});

</script>