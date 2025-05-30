<template>
  <div class="flex flex-col items-center px-2 max-w-full">
    <div class="min-h-screen flex flex-col max-w-7xl w-full">
      <AppHeader
        show-search
        show-user
        :first-name="currentUser?.first_name"
        :last-name="currentUser?.last_name"
        :role="currentUser?.role"
      />
      <StatusBar :step="dashboardState" class="mt-4" />

      <div
        v-if="dashboardState === 1"
        class="my-auto mx-auto max-w-7xl w-full p-12"
      >
        <ActionCard
          v-if="matches.length"
          :button-text="t('dashboard.student.startMatching')"
          card-type="primary"
          @action-button-clicked="navigate('/student/matching')"
        >
          <div class="flex flex-col w-full items-center p-3">
            <h2 class="text-xl mx-4 py-8">
              {{ t("dashboard.student.findSupervisor") }}
            </h2>
            <CardStack :amount="3">
              <SupervisorCard
                :current-capacity="matches[0].availableSpots"
                :description="matches[0].bio"
                :first-name="matches[0].firstName || ''"
                :image="matches[0].profileImage"
                :last-name="matches[0].lastName || ''"
                :max-capacity="matches[0].totalSpots"
                :similarity-score="
                  Math.round(matches[0].compatibilityScore * 100)
                "
                :tags="matches[0].tags"
                name="Hello name"
                size="sm"
              />
            </CardStack>
          </div>
        </ActionCard>
      </div>

      <div
        v-if="dashboardState === 2"
        class="my-auto mx-auto max-w-7xl w-full p-12 flex flex-col gap-8"
      >
        <ActionCard
          :button-text="t('generic.showAll')"
          :header-text="t('dashboard.student.yourRequests')"
          card-type="ghost"
          @action-button-clicked="navigate('/student/requests')"
        >
          <div class="h-96 lg:h-128">
            <div
              class="flex flex-col w-full items-center p-3 overflow-y-auto h-full"
            >
              <div
                v-for="pendingRequest in pendingSupervisionRequests"
                :key="pendingRequest.id"
                class="mb-2 w-full"
              >
                <MiniCard
                  :bottom-text="
                    new Date(pendingRequest.updated_at).toLocaleDateString()
                  "
                  :first-name="pendingRequest.supervisor.user.first_name"
                  :image="pendingRequest.supervisor.user.profile_image"
                  :last-name="pendingRequest.supervisor.user.last_name"
                  :preview-text="`Pending Request to ${pendingRequest.supervisor.user.first_name}`"
                  bottom-icon="tag"
                  top-icon="user-group"
                />
              </div>
            </div>
          </div>
        </ActionCard>
        <ActionCard
          v-if="matches.length"
          :pbutton-text="t('dashboard.student.startMatching')"
          card-type="primary"
          header-text="t('dashboard.student.suggestedMatches')"
          @action-button-clicked="navigateTo('/student/matching')"
        >
          <div class="flex flex-col w-full items-center p-3">
            <CardStack :amount="3">
              <SupervisorCard
                :current-capacity="matches[0].availableSpots"
                :description="matches[0].bio"
                :first-name="matches[0].firstName || ''"
                :image="matches[0].profileImage"
                :last-name="matches[0].lastName || ''"
                :max-capacity="matches[0].totalSpots"
                :similarity-score="
                  Math.round(matches[0].compatibilityScore * 100)
                "
                :tags="matches[0].tags"
                name="Hello name"
                size="sm"
              />
            </CardStack>
          </div>
        </ActionCard>
      </div>

      <div
        v-if="dashboardState === 3"
        class="my-auto mx-auto max-w-7xl w-full p-12"
      >
        <ConfirmationExport
          :accepted-date="acceptedSupervisionRequests[0].updated_at"
          :canvas-id="
            'confirmation-canvas-' + acceptedSupervisionRequests[0].id
          "
          :student-email="acceptedSupervisionRequests[0].student.user.email"
          :student-name="
            acceptedSupervisionRequests[0].student.user.first_name +
            ' ' +
            acceptedSupervisionRequests[0].student.user.last_name
          "
          :supervisor-email="
            acceptedSupervisionRequests[0].supervisor.user.email
          "
          :supervisor-name="
            acceptedSupervisionRequests[0].supervisor.user.first_name +
            ' ' +
            acceptedSupervisionRequests[0].supervisor.user.last_name
          "
        />

        <ConfirmationModal
          :description="warning"
          :linked-component-id="warningModalId"
          confirm-button-color="warning"
          confirm-button-text="OK"
          headline="Warning - Multiple Supervisors"
          hide-cancel-button
          icon="triangle-exclamation"
        />

        <ActionCard
          :button-text="t('dashboard.student.downloadConfirmation')"
          card-type="primary"
          @action-button-clicked="
            downloadImageFromCanvas(
              'confirmation-canvas-' + acceptedSupervisionRequests[0].id
            )
          "
        >
          <div class="h-96 flex">
            <div class="flex flex-col w-full items-center justify-center p-3">
              <Avatar
                :first-name="
                  acceptedSupervisionRequests[0].supervisor.user.first_name
                "
                :last-name="
                  acceptedSupervisionRequests[0].supervisor.user.last_name
                "
                :src="
                  acceptedSupervisionRequests[0].supervisor.user.profile_image
                "
                alt="Profile Picture of {{ acceptedSupervisionRequests[0].supervisor.user.first_name }} {{ acceptedSupervisionRequests[0].supervisor.user.last_name }}"
                ring-color="success"
                shape="circle"
                size="xl"
              />
              <h2 class="text-xl mx-4 py-8 text-center">
                {{ acceptedSupervisionRequests[0].supervisor.user.first_name }}
                {{ acceptedSupervisionRequests[0].supervisor.user.last_name }}
                is your supervisor!
              </h2>
            </div>
          </div>
        </ActionCard>
      </div>

      <div>
        <BottomNav
          :always-show-labels="false"
          :bottom-nav-buttons="bottomNavButtons"
          @navigate="navigate"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useUserStore } from "~/stores/useUserStore";
import { useSupervisorStore } from "~/stores/useSupervisorStore";
import type { UserData } from "#shared/types/userInterfaces";
import type { SupervisorData } from "#shared/types/supervisorInterfaces";
import { useStudentStore } from "~/stores/useStudentStore";

const { t } = useI18n();

const bottomNavButtons = [
  {
    label: t("nav.dashboard"),
    icon: "house",
    route: "/student/dashboard",
  },
  {
    label: t("nav.matching"),
    icon: "user-group",
    route: "/student/matching",
  },
  {
    label: t("generic.requests"),
    icon: "message",
    route: "/student/requests",
  },
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
const currentUser = ref<UserData | null>(null);

// if for some reason the user has more than one accepted supervision request, we will show a warning
const warning = computed(() => {
  if (acceptedSupervisionRequests.length > 1) {
    const namesOfAcceptedSupervisors = acceptedSupervisionRequests.map(
      (request) =>
        `${request.supervisor.user.first_name} ${request.supervisor.user.last_name}`
    );
    return t("dashboard.student.multipleAcceptedWarning", {
      count: acceptedSupervisionRequests.length,
      supervisors: namesOfAcceptedSupervisors.join(", "),
    });
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

if (userStore.user !== null) {
  const res = (await getRecommendedSupervisors(
    userStore.user.id
  )) as SupervisorData[];
  supervisorStore.setSupervisors(res);
  matches.value = res;
  currentUser.value = userStore.user;
}

function navigate(route: string) {
  dummyRoute.value = route;
  navigateTo(route);
}

const dummyRoute = ref("/");
</script>
