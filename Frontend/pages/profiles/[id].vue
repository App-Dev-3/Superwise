<template>
  <div class="size-full flex flex-col justify-center items-center">
    <div
        v-if="pending"
        class="w-full h-full flex flex-col items-center gap-4 pt-6 px-4"
    >
      <div class="skeleton h-24 w-24 shrink-0 rounded-full"/>
      <div class="skeleton h-4 w-20"/>
      <div class="skeleton h-4 w-28"/>
      <div class="skeleton h-32 w-full"/>
    </div>
    <div
        v-else-if="error"
        class="w-full h-full flex flex-col items-center gap-4 pt-6 px-4"
    >
      <FontAwesomeIcon
          class="text-base-content/60 text-6xl"
          icon="link-slash"
      />
      <h1 class="text-base-content/60 text-2xl">
        {{ t("generic.404-not-found") }}
      </h1>
    </div>
    <div v-else class="w-full h-full overflow-y-auto p-6 flex flex-col gap-4">
      <div
          class="w-full flex flex-col items-center gap-3 justify-center pt-6 px-4"
      >
        <Avatar
            :emoji="emoji"
            :first-name="routeParamUser.first_name"
            :last-name="routeParamUser.last_name"
            :src="routeParamUser.profile_image"
            ring-color="info"
            shape="circle"
            size="lg"
        />

        <CustomTag
            :text="t('role.' + routeParamUser.role.toLowerCase())"
            class="opacity-50"
            color="default"
            left-icon="users"
            size="lg"
            variant="outline"
        />

        <div class="flex flex-col items-center gap-1">
          <h1 class="text-header capitalize">
            {{ routeParamUser.first_name }} {{ routeParamUser.last_name }}
          </h1>
          <p class="text-x-small opacity-50">
            {{ routeParamUser.email }}
          </p>
        </div>

        <div class="flex flex-row gap-2 w-full justify-center">
          <CustomButton
              :text="t('generic.mail')"
              block
              color="default"
              left-icon="envelope"
              @click="sendMail"
          />

          <CustomButton
              v-if="
              isSupervisor &&
              currentUser?.role === UserRoles.STUDENT &&
              routeParamUser.is_registered &&
              !routeParamUser.is_deleted
            "
              :text="t('generic.supervisionRequest')"
              block
              color="default"
              left-icon="message"
              @click="askForConfirmation"
          />

          <CustomButton
              v-if="isStudent && studentPendingRequest"
              :text="t('generic.manageRequest')"
              block
              color="default"
              left-icon="message"
              @click="managePendingRequest"
          />
          <CustomButton
              v-if="isStudent && !studentPendingRequest && !hasSupervisor"
              :text="t('generic.addStudent')"
              block
              color="default"
              left-icon="message"
              @click="manageAddAsSupervisee"
          />
        </div>
      </div>

      <div
          v-if="routeParamUser.is_registered && !routeParamUser.is_deleted"
          class="w-full h-full flex flex-col gap-4"
      >
        <hr v-if="!isAdmin" class="border-base-300 text-base-300">

        <div
            v-if="!isAdmin"
            class="w-full flex justify-center flex-col p-4 gap-3"
        >
          <div class="w-full flex flex-row flex-wrap gap-2 justify-center">
            <CustomTag
                v-for="(tag, index) in routeParamUser.tags"
                :key="`selected-${index}`"
                :color="
                currentUserTags.some((currUserTag) => currUserTag.id === tag.id)
                  ? 'primary'
                  : 'default'
              "
                :text="tag.tag.tag_name"
            />
          </div>
        </div>

        <hr v-if="!isAdmin" class="border-base-300 text-base-300">

        <SupervisorStatistics
            v-if="isSupervisor"
            :compatibility="compatability"
            :currently-supervising="
            routeParamUser.supervisor_profile.available_spots
          "
            :first-name="routeParamUser.first_name"
            :last-name="routeParamUser.last_name"
            :pending="pendingRequests"
            :slots="routeParamUser.supervisor_profile.total_spots"
        />

        <hr v-if="isSupervisor" class="border-base-300 text-base-300">

        <div v-if="!isAdmin" class="p-3">
          <ProfileDescription
              :content="
              isStudent
                ? routeParamUser.student_profile.thesis_description || ''
                : routeParamUser.supervisor_profile.bio || ''
            "
              :headline="isStudent ? t('generic.thesisDescription') : 'Bio'"
          />
        </div>
      </div>

      <div v-else class="pt-4">
        <hr class="border-base-300 text-base-300">

        <div class="alert alert-warning" role="alert">
          <FontAwesomeIcon class="opacity-75" icon="warning"/>
          <span
          >{{ t("profile.warning") }}:
            <span class="font-bold">
              {{ routeParamUser.first_name }} {{ routeParamUser.last_name }}
            </span>
            {{ t("profile.warningMessage") }}
          </span>
        </div>
      </div>
    </div>

    <Toast
        v-if="toastData.visible"
        :duration="8000"
        :message="toastData.message"
        :type="toastData.type"
        @close="toastData.visible = false"
        @button-click="toastData.visible = false"
    />

    <ConfirmationModal
        :confirm-button-text="modalInformation.confirmButtonText"
        :cancel-button-text="modalInformation.cancelButtonText"
        :description="modalInformation.description"
        :headline="modalInformation.headline"
        :image="modalInformation.image"
        :linked-component-id="modalInformation.linkedComponentId"
        confirm-button-color="primary"
        hide-dont-show-again
        :icon="modalInformation.icon"
        @abort="handleModalAbort"
        @confirm="handleModalConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import CustomButton from "~/components/CustomButton/CustomButton.vue";
import ProfileDescription from "~/components/ProfileViewComponents/ProfileDescription.vue";
import {
  HttpMethods,
  supervisionRequestStatus,
} from "~/shared/enums/enums";
import SupervisorStatistics from "~/components/ProfileViewComponents/SupervisorStatistics.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { UserRoles } from "#shared/enums/enums";

const { t } = useI18n();
const userStore = useUserStore();
const supervisorStore = useSupervisorStore();
if (!userStore.user) {
  await userStore.refetchCurrentUser();
}
const currentUser = userStore.user;
const route = useRoute();
const routeParamUserId = route.params.id as string;

const isOwnProfile = computed(() => currentUser?.id === routeParamUserId);
const isAdmin = computed(() => {
  return routeParamUser.value.role === UserRoles.ADMIN;
});
const isSupervisor = computed(() => {
  return routeParamUser.value.role === UserRoles.SUPERVISOR;
});
const isStudent = computed(() => {
  return routeParamUser.value.role === UserRoles.STUDENT;
});
//hacky solution, begin with true to not show the button. IF no supervisor, turn it false
const hasSupervisor = ref(true)

onMounted(async() => {
  if (isStudent.value) {
    await supervisorStore.getSupervisionRequests();
    const data = await $fetch(
      `/api/supervision-requests/count/${routeParamUserId}`,
      {
        method: HttpMethods.GET,
        query: {
          request_state: supervisionRequestStatus.ACCEPTED,
        },
      }
    );
    if (data.request_count === 0) {
      hasSupervisor.value = false;
    }
    console.log("requests", supervisorStore.supervisionRequests);
  }
});


const { data, error, pending } = await useFetch(
    `/api/users/${ routeParamUserId }/with-relations`
);
const routeParamUser = data;

const studentPendingRequest = computed(() => {
  return supervisorStore.supervisionRequests?.find(
    request => 
      request.student.user_id === routeParamUser.value.id &&
      request.request_state === supervisionRequestStatus.PENDING

  );
});

const toastData = ref({
  visible: false,
  type: "success",
  message: "",
});

const modalInformation = ref({
  visible: false,
  confirmButtonText: t("modal.confirm"),
  cancelButtonText: t("generic.cancel"),
  icon: '',
  headline: "",
  description: t("modal.supervisionInfo"),
  image: routeParamUser.value.profile_image || "",
  linkedComponentId: `profilesConfirmationModal-${ routeParamUserId }`,
});

const sendMail = () => {
  const email = routeParamUser.value.email;
  if (email) {
    window.location.href = `mailto:${ email }`;
  } else {
    console.error("No email address available for this user.");
  }
};

const askForConfirmation = () => {
  if (isOwnProfile.value) {
    toastData.value = {
      visible: true,
      type: "error",
      message: t("profile.errorOwnProfile"),
    };
    return;
  }
  modalInformation.value = {
    ...modalInformation.value,
    visible: true,
    confirmButtonText: t("modal.confirm"),
    headline: t("modal.sendSupervisionRequestHeadline"),
    description: t("modal.supervisionInfo"),
    image: routeParamUser.value.profile_image || "",
    linkedComponentId: `profilesConfirmationModal-${ routeParamUserId }`,
  };
  openModal();
};

const manageAddAsSupervisee = () => {
  modalInformation.value = {
    visible: true,
    confirmButtonText: t("modal.supervisee.accept"),
    cancelButtonText: t("generic.cancel"),
    headline: t("modal.supervisee.headline"),
    icon: 'envelope',
    description: t("modal.supervisee.description"),
    image: routeParamUser.value.profile_image || "",
    linkedComponentId: `profilesConfirmationModal-${ routeParamUserId }`,
  }; 
  openModal();
};

const addStudentAsSupervisee = async() => {
  await $fetch("/api/supervision-requests", {
    method: "POST",
    body: {
      supervisor_id: currentUser?.id,
      student_email: routeParamUser.value.email,
    },
  });
  toastData.value = {
      visible: true,
      type: "success",
      message: t("toast.addedStudentAsSupervisee"),
    };
}

const sendSupervisionRequest = async () => {
  closeModal();
  try {
    await $fetch("/api/supervision-requests", {
      method: "POST",
      body: {
        student_email: currentUser?.email,
        supervisor_id: routeParamUser.value.supervisor_profile.id,
      },
    });
    toastData.value = {
      visible: true,
      type: "success",
      message: t("profile.requestSent"),
    };
  } catch (error) {
    switch (error.response.status) {
      case 400:
        toastData.value = {
          visible: true,
          type: "error",
          message: "Something went wrong",
        };
        console.error("Error sending supervision request:", error);
        break;
      case 404:
        toastData.value = {
          visible: true,
          type: "error",
          message: t("generic.404-not-found"),
        };
        break;
      case 409:
        toastData.value = {
          visible: true,
          type: "error",
          message:
              "You have already sent a supervision request to this supervisor.",
        };
        break;
      default:
        toastData.value = {
          visible: true,
          type: "error",
          message: "Request failed with status code " + error.response.status,
        };
        console.error("Error sending supervision request:", error);
        break;
    }
  }
};

const managePendingRequest = (() =>{
  console.log("Managing supervision request for user:", routeParamUser.value);
  modalInformation.value = {
    visible: true,
    confirmButtonText: t("modal.handleRequest.accept"),
    cancelButtonText: t("modal.handleRequest.dismiss"),
    headline: t("modal.handleRequest.headline"),
    icon: 'xmark',
    description: t("modal.handleRequest.description", {
      firstName: routeParamUser.value.first_name,
      lastName: routeParamUser.value.last_name,
    }),
    image: routeParamUser.value.profile_image || "",
    linkedComponentId: `profilesConfirmationModal-${ routeParamUserId }`,
  };
  openModal();
});

const acceptPendingRequest = async () => {
  if (!studentPendingRequest.value) {
    console.error("No pending request found for the student.");
    return;
  }
  try {
    await $fetch(`/api/supervision-requests/${ studentPendingRequest.value.id }`, {
      method: HttpMethods.PATCH,
      body: {
        request_state: supervisionRequestStatus.ACCEPTED,
      },
    });
    toastData.value = {
      visible: true,
      type: "success",
      message: t("toast.acceptedStudentRequest"),
    };
  } catch (error) {
    console.error("Error accepting pending request:", error);
  }
}

const dismissPendingRequest = async () => {
  if (!studentPendingRequest.value) {
    console.error("No pending request found for the student.");
    return;
  }
  try {
    await $fetch(`/api/supervision-requests/${ studentPendingRequest.value.id }`, {
      method: HttpMethods.PATCH,
      body: {
        request_state: supervisionRequestStatus.REJECTED,
      },
    });
    toastData.value = {
      visible: true,
      type: "error",
      message: t("toast.withdrawnStudentRequest"),
    };
  } catch (error) {
    console.error("Error dismissing pending request:", error);
    toastData.value = {
      visible: true,
      type: "error",
      message: t("toast.somethingWentWrong"),
    };
  }
}

const handleModalAbort = () => {
  if (isSupervisor.value){
    closeModal();
  } else if (isStudent.value) {
    dismissPendingRequest();
  }
}

const handleModalConfirm = () => {
  if (isSupervisor.value) {
    sendSupervisionRequest();
  } else if (isStudent.value) {
    if (studentPendingRequest.value) {
      acceptPendingRequest();
    } else {
      addStudentAsSupervisee();
    }
  }
  closeModal();
};

const closeModal = () => {
  const modal = document.getElementById(
      modalInformation.value.linkedComponentId
  ) as HTMLDialogElement;
  if (modal) modal.close();
};

const openModal = () => {
  const modal = document.getElementById(
      modalInformation.value.linkedComponentId
  ) as HTMLDialogElement;
  if (modal) modal.showModal();
};

const emoji = computed(() => {
  switch (routeParamUser.value.role) {
    case "STUDENT":
      return "🎓";
    case "SUPERVISOR":
      return "👨‍🏫";
    case "ADMIN":
      return "⚙️";
    default:
      return "👤";
  }
});


const currentUserTags = ref([]);
if (currentUser?.id) {
  try {
    const { data } = await useFetch(`/api/users/${ currentUser.id }/tags`);
    currentUserTags.value = data.value || [];
  } catch (e) {
    console.error("Error fetching current user tags:", e);
  }
}

// TODO: make these values dynamic
const compatability = ref(75);
const pendingRequests = ref(1);

definePageMeta({
  layout: "generic-back-layout",
});
</script>
