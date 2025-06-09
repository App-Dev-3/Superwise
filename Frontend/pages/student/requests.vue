<script lang="ts" setup>
import { useStudentStore } from "~/stores/useStudentStore";
import EmptyPagePlaceholder from "~/components/Placeholder/EmptyPagePlaceholder.vue";
import { supervisionRequestStatus, supervisionRequestType, HttpMethods } from "~/shared/enums/enums";
import type { ConfirmationDialogData } from "~/shared/types/userInterfaces";
import { nextTick, ref } from "vue";
import type { SupervisionRequestsData } from "~/shared/types/supervisorInterfaces";
import { getPlaceholderImage } from "~/utils/uiHelpers";

const { t } = useI18n();
const studentStore = useStudentStore();
const settingsStore = useSettingsStore();

const { pendingSupervisionRequests, rejectedSupervisionRequests } = storeToRefs(studentStore)
const modalInformation = ref<ConfirmationDialogData | null>(null)
const toast = ref({
  visible: false,
  type: "success",
  message: "This is a toast message",
});

onMounted(() => {
  studentStore.fetchSupervisionRequests()
})

onUnmounted(async () => {
  if (toast.value.visible) {
    console.log("i am finna delete")
    await handleToastClosed();
  }
});

const sortedRequests = computed(() => {
  return [ ...(pendingSupervisionRequests.value || []) ]
      .sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
});

function navigate(route: string) {
  navigateTo(route);
}

async function handleWithdrawRequest(request: SupervisionRequestsData) {
  if (toast.value.visible && modalInformation.value) {
    await handleToastClosed();
  }
   modalInformation.value = {
    type: supervisionRequestType.DISMISS,
    headline: `Withdraw Supervision Request`,
    icon: '',
    warning: '',
    description: `Would you like to withdraw the supervision request from
        ${ request.student.user.first_name } ${ request.student.user.last_name }? Once withdrawn, the supervisor will no longer see this request.`,
    confirmButtonText: 'Withdraw Request',
    confirmButtonColor: 'error',
    request: request,
  };
  if (settingsStore.settings?.showSupervisionAcceptModal) {
    openModal();
  } else {
    showToastInformation();
  }
}

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
    handleWithdrawAction(modalInformation.value.request);
  }
};

const handleWithdrawAction = async (request: SupervisionRequestsData) => {
  await $fetch(`/api/supervision-requests/${request.id}`, {
    method: HttpMethods.PATCH,
    body: {
      request_state: supervisionRequestStatus.WITHDRAWN,
    },
  });
  modalInformation.value = null;
}

const handleToastUndoClick = async () => {
  toast.value.visible = false;
  if (modalInformation.value?.request) {
    studentStore.addPendingSupervisionRequest(modalInformation.value.request);
    modalInformation.value = null;
  }
};

const showToastInformation = () => {
  if (toast.value.visible) {
    handleToastClosed();
  }
  if (modalInformation.value?.request) {
    studentStore.removePendingSupervisionRequest(modalInformation.value.request.id);
  }
  toast.value = {
    visible: true,
    type: "success",
    message: "You have withdrawn; the supervision request",
  };
};

const handleModalDontShowAgain = () => {
  settingsStore.settings = {
    ...settingsStore.settings,
    showSupervisionAcceptModal: false,
  };
};

const openModal = async () => {
  await nextTick();
  const modal = document.getElementById('confirmationModal') as HTMLDialogElement
  modal?.showModal()
}

definePageMeta({
  layout: "student-base-layout",
});
</script>

<template>
  <div class="size-full flex overflow-y-auto flex-col py-3 px-8">
    <MiniCard
        v-for="pendingRequest in sortedRequests"
        :key="pendingRequest.id"
        :bottom-text="new Date(pendingRequest.updated_at).toLocaleDateString()"
        :first-name="pendingRequest.supervisor.user.first_name"
        :image="pendingRequest.supervisor.user.profile_image"
        :last-name="pendingRequest.supervisor.user.last_name"
        :preview-text="`Pending Request to ${pendingRequest.supervisor.user.first_name}`"
        bottom-icon="tag"
        class="cursor-pointer"
        top-icon="user-group"
        :show-delete="true"
        @card-clicked="console.log('Card clicked')"
        @delete-clicked="handleWithdrawRequest(pendingRequest)"
    />

    <EmptyPagePlaceholder
        :render-condition="pendingSupervisionRequests"
        :text="t('requests.noRequests')"
        class="w-full"
    />
    <CustomAccordion
        v-if="rejectedSupervisionRequests.length > 0"
        :icon="['fas', 'clock']"
        :icon-class="'text-yellow-500'"
        :title="t('requests.rejectedRequests')"
        class="size-full mt-4"
    >
      <MiniCard
          v-for="rejectedRequest in rejectedSupervisionRequests" :key="rejectedRequest.id"
          :bottom-text="new Date(rejectedRequest.updated_at).toLocaleDateString()"
          :first-name="rejectedRequest.supervisor.user.first_name"
          :image="rejectedRequest.supervisor.user.profile_image"
          :last-name="rejectedRequest.supervisor.user.last_name"
          :preview-text="`Rejected request to ${rejectedRequest.supervisor.user.first_name}`"
          bottom-icon="tag"
          class="cursor-pointer opacity-75"
          top-icon="user-group"
          @click="navigate(`/profiles/${rejectedRequest.supervisor.user_id}`)"
      />
    </CustomAccordion>
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
        @confirm="showToastInformation()"
        @dont-show-again="handleModalDontShowAgain"
    />
  </div>
  
</template>

<style scoped>

</style>