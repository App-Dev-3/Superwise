<template>
  <div>
    <AppHeader
      show-search
      show-user
      :first-name="current_user?.first_name"
      :last-name="current_user?.last_name"
      :image="current_user?.profile_image"
    />

    <slot />

    <BottomNav
      :bottom-nav-buttons="bottomNavButtons"
      :always-show-labels="false"
      @navigate="navigate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "~/stores/useUserStore";
import { useSupervisorStore } from "~/stores/useSupervisorStore";
import type { UserData } from "#shared/types/userInterfaces";
import type { SupervisorData } from "#shared/types/supervisorInterfaces";
import { useStudentStore } from "~/stores/useStudentStore";

const bottomNavButtons = [
  { label: "Dashboard", icon: "house", route: "/student/dashboard" },
  { label: "Matching", icon: "user-group", route: "/student/matching" },
  { label: "Requests", icon: "message", route: "/student/requests" },
];
const { user } = useUser();
const { getUserByEmail, getRecommendedSupervisors } = useUserApi();
const userStore = useUserStore();
const supervisorStore = useSupervisorStore();
const studentStore = useStudentStore();

await callOnce(() => studentStore.fetchSupervisionRequests(), {
  mode: "navigation",
});
const dashboardState = studentStore.dashboardState;
const pendingSupervisionRequests = studentStore.pendingSupervisionRequests;
const acceptedSupervisionRequests = studentStore.acceptedSupervisionRequests;
const current_user = ref<UserData1 | null>(null);
console.log(current_user.value);

// if for some reason the user has more than one accepted supervision request, we will show a warning
const warning = computed(() => {
  if (acceptedSupervisionRequests.length > 1) {
    const namesOfAcceptedSupervisors = acceptedSupervisionRequests.map(
      (request) =>
        `${request.supervisor.user.first_name} ${request.supervisor.user.last_name}`
    );
    return `You accepted ${
      acceptedSupervisionRequests.length
    } supervision requests, but you only need one supervisor. Please talk to ${namesOfAcceptedSupervisors.join(
      ", "
    )} and resolve the conflict.`;
  }
  return "";
});

const warningModalId = computed(() => {
  if (acceptedSupervisionRequests.length > 0) {
    return `confirmation-modal-${acceptedSupervisionRequests[0].id}`;
  }
  return "confirmation-modal-warning";
});

onMounted(() => {
  // Give the DOM time to fully render before trying to access the modal
  setTimeout(() => {
    if (acceptedSupervisionRequests.length > 1) {
      const modal = document.getElementById(
        warningModalId.value
      ) as HTMLDialogElement;
      if (modal) {
        modal.showModal();
      } else {
        console.error("Warning modal element not found:", warningModalId.value);
      }
    }
  }, 500); // Small delay to ensure DOM is ready
});

watch(
  () => acceptedSupervisionRequests.length,
  (newLength) => {
    if (newLength > 1) {
      nextTick(() => {
        setTimeout(() => {
          const modal = document.getElementById(
            warningModalId.value
          ) as HTMLDialogElement;
          if (modal) {
            modal.showModal();
          } else {
            console.error("Modal element not found:", warningModalId.value);
          }
        }, 100);
      });
    }
  },
  { immediate: true }
);

const matches = ref([] as SupervisorData[]);

if (!userStore.user && user.value?.primaryEmailAddress?.emailAddress) {
  const res = (await getUserByEmail(
    user.value?.primaryEmailAddress.emailAddress
  )) as UserData;
  userStore.setUser(res);
}

current_user.value = userStore.user;
console.log(current_user.value);

if (userStore.user !== null) {
  const res = (await getRecommendedSupervisors(
    userStore.user.id
  )) as SupervisorData[];
  supervisorStore.setSupervisors(res);
  matches.value = res;
}

function navigate(route: string) {
  dummyRoute.value = route;
  navigateTo(route);
}

const dummyRoute = ref("/");
</script>
