<template>
  <div class="flex flex-col size-full items-center px-6 py-8 gap-8">
    <SwipeContainer
      v-for="(request, index) in sortedRequests"
      :key="request.id || index"
      :ref="(el) => setItemRef(el, request.id)"
      class="mb-4 w-full max-w-xl sm:w-auto self-center"
      @swipe-left="handleSwipeLeft(request)"
      @swipe-right="handleSwipeRight(request)"
    >
      <MiniCard
        :bottom-text="new Date(request.updated_at).toLocaleDateString()"
        :first-name="request.student.user.first_name"
        :image="request.student.user.profile_image"
        :last-name="request.student.user.last_name"
        :preview-text="
          t('matching.supervisionRequest', {
            name: request.student.user.first_name,
          })
        "
        bottom-icon="tag"
        top-icon="user-group"
      />
    </SwipeContainer>
    <EmptyPagePlaceholder
      :render-condition="sortedRequests"
      :text="t('matching.noRequests')"
    />
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
      :image="
        modalInformation.request.student.user.profile_image ||
        getPlaceholderImage(
          modalInformation.request.student.user.first_name,
          modalInformation.request.student.user.last_name
        )
      "
      linked-component-id="confirmationModal"
      @abort="handleActionResetSwipe(modalInformation.request)"
      @confirm="showToastInformation(modalInformation.type)"
      @dont-show-again="handleModalDontShowAgain(modalInformation.type)"
    />
  </div>
</template>

<script lang="ts" setup>
import type { SwipeContainer } from "#components";
import { nextTick, ref } from "vue";
import {
  HttpMethods,
  supervisionRequestStatus,
  supervisionRequestType,
} from "~/shared/enums/enums";
import type { SupervisionRequestsData } from "~/shared/types/supervisorInterfaces";
import type { ConfirmationDialogData } from "~/shared/types/userInterfaces";
import EmptyPagePlaceholder from "~/components/Placeholder/EmptyPagePlaceholder.vue";

const supervisorStore = useSupervisorStore();
const settingsStore = useSettingsStore();
const swipeContainerRefs = ref<
  Record<string, InstanceType<typeof SwipeContainer> | null>
>({});
const modalInformation = ref<ConfirmationDialogData | null>(null);
const currentActionRequest = ref<SupervisionRequestsData | null>(null);
const toast = ref({
  visible: false,
  type: "success",
  message: "This is a toast message",
});

const { t } = useI18n();

onMounted(async () => {
  await supervisorStore.getSupervisionRequests();
});

onUnmounted(async () => {
  if (toast.value.visible) {
    await handleToastClosed();
  }
});

const sortedRequests = computed(() => {
  return [...(supervisorStore.supervisionRequests || [])].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
});

const handleSwipeRight = async (request: SupervisionRequestsData) => {
  // quickest solution in the wild west for the bug where spamming the slider wont send old requests
  if (toast.value.visible && modalInformation.value) {
    await handleToastClosed();
  }
  currentActionRequest.value = request;
  modalInformation.value = {
    type: supervisionRequestType.CONFIRM,
    headline: t("matching.acceptRequest"),
    icon: "",
    warning: "",
    description: t("matching.acceptRequestDescription", {
      firstName: request.student.user.first_name,
      lastName: request.student.user.last_name,
    }),
    confirmButtonText: t("matching.acceptRequestButton"),
    confirmButtonColor: "primary",
    request: request,
  };
  if (settingsStore.settings?.showSupervisionAcceptModal) {
    openModal();
  } else {
    supervisorStore.removeSupervisionRequest(request.id);
    showToastInformation(supervisionRequestType.CONFIRM);
  }
};

const handleSwipeLeft = async (request: SupervisionRequestsData) => {
  // quickest solution in the wild west for the bug where spamming the slider wont send old requests
  if (toast.value.visible && modalInformation.value) {
    await handleToastClosed();
  }
  currentActionRequest.value = request;
  modalInformation.value = {
    type: supervisionRequestType.DISMISS,
    headline: t("matching.rejectRequest"),
    icon: "",
    warning: "",
    description: t("matching.rejectRequestDescription", {
      firstName: request.student.user.first_name,
      lastName: request.student.user.last_name,
    }),
    confirmButtonText: t("matching.rejectRequestButton"),
    confirmButtonColor: "error",
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
    await useFetch(`/api/supervision-requests/${request.id}`, {
      method: HttpMethods.PATCH,
      body: {
        request_state: supervisionRequestStatus.ACCEPTED,
      },
    });
  } else if (modalInformation.value?.type === supervisionRequestType.DISMISS) {
    await useFetch(`/api/supervision-requests/${request.id}`, {
      method: HttpMethods.PATCH,
      body: {
        request_state: supervisionRequestStatus.REJECTED,
      },
    });
  }
};

const openModal = async () => {
  await nextTick();
  const modal = document.getElementById(
    "confirmationModal"
  ) as HTMLDialogElement;
  modal?.showModal();
};

const handleModalDontShowAgain = (type: supervisionRequestType) => {
  switch (type) {
    case supervisionRequestType.CONFIRM:
      settingsStore.setSettings({
        ...settingsStore.settings,
        showSupervisionAcceptModal: false,
      });
      break;
    case supervisionRequestType.DISMISS:
      settingsStore.setSettings({
        ...settingsStore.settings,
        showSupervisionRejectModal: false,
      });
      break;
    default:
      console.warn("Unknown type for handleModalDontShowAgain:", type);
  }
};

const handleActionResetSwipe = (request: SupervisionRequestsData) => {
  const ref = swipeContainerRefs.value[request.id];
  ref?.reset?.();
};

const setItemRef = (
  el: InstanceType<typeof SwipeContainer> | null,
  id: string
) => {
  if (el) {
    swipeContainerRefs.value[id] = el;
  }
};

const showToastInformation = (type: string) => {
  if (toast.value.visible) {
    handleToastClosed();
  }
  if (modalInformation.value?.request?.id) {
    supervisorStore.removeSupervisionRequest(
      modalInformation.value?.request?.id
    );
  }
  if (type === supervisionRequestType.CONFIRM) {
    toast.value = {
      visible: true,
      type: "success",
      message: t("matching.confirmationToast", {
        type: "accepted",
      }),
    };
  } else if (type === supervisionRequestType.DISMISS) {
    toast.value = {
      visible: true,
      type: "error",
      message: t("matching.confirmationToast", {
        type: "rejected",
      }),
    };
  }
};

definePageMeta({
  layout: "supervisor-base-layout",
});
</script>
