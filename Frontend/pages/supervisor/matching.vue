<template>
  <div class="flex flex-col items-center px-2 max-w-full">
    <div class="min-h-screen flex flex-col max-w-7xl w-full">
      <div class="fixed top-0 z-10 left-0 right-0  max-w-3xl">
        <!-- Is this the header thats supposed to be used??-->
        <AdminHeader
            header-text="Supervision Requests"
            variant="default"
        />
      </div>
      <div class="mt-36 mb-16 flex flex-col items-center justify-center w-full">
        <SwipeContainer
            v-for="(request, index) in sortedRequests"
            :key="request.id || index"
            :ref="el => setItemRef(el, request.id)"
            :swipe-threshold="10"
            class="mb-4"
            @swipe-left="handleSwipeLeft(request)"
            @swipe-right="handleSwipeRight(request)"
        >
          <NuxtLink 
            :to="`/profiles/${request.student.user_id}`"
          >
            <MiniCard
              :bottom-text="new Date(request.updated_at).toLocaleDateString()"
              :first-name="request.student.user.first_name"
              :image="request.student.user.profile_image"
              :last-name="request.student.user.last_name"
              :preview-text="`${request.student.user.first_name} wants to be supervised by you`"
              bottom-icon="tag"
              top-icon="user-group"
            />
          </NuxtLink>
        </SwipeContainer>
      </div>

      <div>
        <BottomNav
            :bottom-nav-buttons="bottomNavButtons"
            @navigate="navigate"
        />
      </div>
    </div>
    <Toast
        v-if="toast.visible"
        :duration="3000"
        :message="toast.message"
        :type="toast.type"
        button-text="Undo"
        @close="handleToastClosed"
        @button-click="handleToastUndoClick"
    />
    <ConfirmationModal
        v-if="modalInformation && modalInformation.request"
        :confirm-button-color="modalInformation.confirmButtonColor"
        :confirm-button-text="modalInformation.confirmButtonText"
        :description="modalInformation.description"
        :headline="modalInformation.headline"
        :icon="modalInformation.icon"
        :image="modalInformation.request.student.user.profile_image || getPlaceholderImage(modalInformation.request.student.user.first_name, modalInformation.request.student.user.last_name)"
        linked-component-id="confirmationModal"
        @abort="handleActionResetSwipe(modalInformation.request)"
        @confirm="showToastInformation(modalInformation.type)"
        @dont-show-again="handleModalDontShowAgain(modalInformation.type)"
    />
  </div>
</template>

<script lang="ts" setup>
import type { SwipeContainer } from '#components';
import { nextTick, ref } from 'vue';
import { HttpMethods, supervisionRequestStatus, supervisionRequestType } from '~/shared/enums/enums';
import type { SupervisionRequestsData } from '~/shared/types/supervisorInterfaces';
import type { ConfirmationDialogData } from '~/shared/types/userInterfaces';


const supervisorStore = useSupervisorStore();
const settingsStore = useSettingsStore();


const swipeContainerRefs = ref<Record<string, InstanceType<typeof SwipeContainer> | null>>({})
const modalInformation = ref<ConfirmationDialogData | null>(null)
const currentActionRequest = ref<SupervisionRequestsData | null>(null);
const toast = ref({
  visible: false,
  type: "success",
  message: "This is a toast message",
});

if (!supervisorStore.supervisionRequests || !supervisorStore.supervisionRequests.length) {
  const { data, error } = await useFetch<SupervisionRequestsData[]>('/api/supervision-requests', {
    method: HttpMethods.GET,
    params: {
      request_state: supervisionRequestStatus.PENDING
    }
  });
  if (error.value) {
    navigateTo('/supervisor/dashboard');
  } else if (data.value) {
    supervisorStore.setSupervisionRequests(data.value);
  }
}

const sortedRequests = computed(() => {
  return [ ...(supervisorStore.supervisionRequests || []) ]
      .sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
});
console.log('Supervisor Store:', sortedRequests.value);

const handleSwipeRight = (request: SupervisionRequestsData) => {
  // quickest solution in the wild west for the bug where spamming the slider wont send old requests
  if (toast.value.visible) {
    handleToastClosed();
  }
  currentActionRequest.value = request;
  modalInformation.value = {
    type: supervisionRequestType.CONFIRM,
    headline: `Accept Supervision Request`,
    icon: '',
    warning: '',
    description: `Would you like to accept the supervision request from
        ${ request.student.user.first_name } ${ request.student.user.last_name }? Once accepted You will officially be a supervisor-student pair`,
    confirmButtonText: 'Accept Request',
    confirmButtonColor: 'primary',
    request: request,
  };
  if (settingsStore.settings?.showSupervisionAcceptModal) {
    openModal();
  } else {
    supervisorStore.removeSupervisionRequest(request.id);
    showToastInformation(supervisionRequestType.CONFIRM);
  }
};

const handleSwipeLeft = (request: SupervisionRequestsData) => {
  // quickest solution in the wild west for the bug where spamming the slider wont send old requests
  if (toast.value.visible) {
    handleToastClosed();
  }
  currentActionRequest.value = request;
  modalInformation.value = {
    type: supervisionRequestType.DISMISS,
    headline: `Reject Supervision Request`,
    icon: '',
    warning: '',
    description: `Are you sure you want to reject the supervision request sent by ${ request.student.user.first_name } ${ request.student.user.last_name }?`,
    confirmButtonText: 'Reject Request',
    confirmButtonColor: 'error',
    request: request,
  };
  if (settingsStore.settings?.showSupervisionRejectModal) {
    openModal();
  } else {
    supervisorStore.removeSupervisionRequest(request.id);
    showToastInformation(supervisionRequestType.DISMISS);
  }
};

const handleToastUndoClick = async () => {
  toast.value.visible = false;
  if (currentActionRequest.value) {
    supervisorStore.addSupervisionRequest(currentActionRequest.value);
    handleActionResetSwipe(currentActionRequest.value);
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
  toast.value.visible = false;
  if (modalInformation.value?.request) {
    handleActionConfirmation(modalInformation.value.request);
  }
};

const handleActionConfirmation = async (request: SupervisionRequestsData) => {
  if (modalInformation.value?.type === supervisionRequestType.CONFIRM) {
    await useFetch(`/api/supervision-requests/${ request.id }`, {
      method: HttpMethods.PATCH,
      body: {
        request_state: supervisionRequestStatus.ACCEPTED
      }
    });
  } else if (modalInformation.value?.type === supervisionRequestType.DISMISS) {
    await useFetch(`/api/supervision-requests/${ request.id }`, {
      method: HttpMethods.PATCH,
      body: {
        request_state: supervisionRequestStatus.REJECTED
      }
    });
  }
}


const openModal = async () => {
  await nextTick();
  const modal = document.getElementById('confirmationModal') as HTMLDialogElement
  modal?.showModal()
}

const handleModalDontShowAgain = (type: supervisionRequestType) => {
    switch (type) {
        case supervisionRequestType.CONFIRM:
            settingsStore.setSettings({
            ...settingsStore.settings,
            showSupervisionAcceptModal: false
            });
            break;
        case supervisionRequestType.DISMISS:
            settingsStore.setSettings({
            ...settingsStore.settings,
            showSupervisionRejectModal: false
            });
            break;
        default:
            console.warn("Unknown type for handleModalDontShowAgain:", type);
    }
};

const handleActionResetSwipe = (request: SupervisionRequestsData) => {
  const ref = swipeContainerRefs.value[request.id]
  ref?.reset?.()
};

const setItemRef = (el: InstanceType<typeof SwipeContainer> | null, id: string) => {
  if (el) {
    swipeContainerRefs.value[id] = el
  }
}

const showToastInformation = (type: string) => {
  if (toast.value.visible) {
    console.log("Toast already visible, making request.😂😂😂😂");
    handleToastClosed();
  }
  if (modalInformation.value?.request?.id) {
    supervisorStore.removeSupervisionRequest(modalInformation.value?.request?.id);
  }
  if (type === supervisionRequestType.CONFIRM) {
    toast.value = {
      visible: true,
      type: "success",
      message: "You accepted the supervision request",
    };
  } else if (type === supervisionRequestType.DISMISS) {
    console.log("😀😀😀😀");
    toast.value = {
      visible: true,
      type: "error",
      message: "You rejected the supervision request",
    };
  }
};


function navigate(route: string) {
  dummyRoute.value = route;
  navigateTo(route);
}

const { t } = useI18n();

const bottomNavButtons = [
  { label: t('nav.dashboard'), icon: 'house', route: '/supervisor/dashboard' },
  { label: t('nav.matching'), icon: 'user-group', route: '/supervisor/matching' },
  { label: t('nav.confirmed'), icon: 'message', route: '/supervisor/confirmed' }
]

const dummyRoute = ref("/");

</script>

<style scoped>

</style>