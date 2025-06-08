<script lang="ts" setup>
import { useStudentStore } from "~/stores/useStudentStore";
import EmptyPagePlaceholder from "~/components/Placeholder/EmptyPagePlaceholder.vue";
import { supervisionRequestStatus, supervisionRequestType } from "~/shared/enums/enums";
import type { ConfirmationDialogData } from "~/shared/types/userInterfaces";
import { nextTick, ref } from "vue";
import type { SupervisionRequestsData } from "~/shared/types/supervisorInterfaces";
import { getPlaceholderImage } from "~/utils/uiHelpers";

const { t } = useI18n();
const studentStore = useStudentStore();
const settingsStore = useSettingsStore();

const { pendingSupervisionRequests, rejectedSupervisionRequests } = storeToRefs(studentStore)
const modalInformation = ref<ConfirmationDialogData | null>(null)


onMounted(() => {
  studentStore.fetchSupervisionRequests()
})

function navigate(route: string) {
  navigateTo(route);
}

async function handleWithdrawRequest(request: SupervisionRequestsData) {

  console.log('handleWithdrawRequest called with request:', request);
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
  if (settingsStore.settings?.showSupervisionRejectModal) {
    openModal();
  } else {
    // supervisorStore.removeSupervisionRequest(request.id);
    // showToastInformation(supervisionRequestType.DISMISS);
  }
  // await $fetch(`/api/supervision-requests/${request.id}`, {
  //   method: "PATCH",
  //   body: {
  //     request_state: supervisionRequestStatus.WITHDRAWN,
  //   },
  // });
}




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
        v-for="pendingRequest in pendingSupervisionRequests"
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
        @cardClicked="console.log('Card clicked')"
        @deleteClicked="handleWithdrawRequest(pendingRequest)"
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
    <ConfirmationModal
        v-if="modalInformation && modalInformation.request"
        :confirm-button-color="modalInformation.confirmButtonColor"
        :confirm-button-text="modalInformation.confirmButtonText"
        :description="modalInformation.description"
        :headline="modalInformation.headline"
        :icon="modalInformation.icon"
        :image="modalInformation.request.student.user.profile_image || getPlaceholderImage(modalInformation.request.student.user.first_name, modalInformation.request.student.user.last_name)"
        linked-component-id="confirmationModal"
        @abort="console.log('Dont show again clicked')"
        @confirm="showToastInformation(modalInformation.type)"
        @dont-show-again="console.log('Dont show again clicked')"
    />
  </div>
  
</template>

<style scoped>

</style>