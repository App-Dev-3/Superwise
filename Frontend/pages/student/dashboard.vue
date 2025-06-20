<template>
  <div class="flex flex-col w-full">
    <div v-if="isLoading">
      <SkeletonStatusBar class="my-4"/>
      <div class="w-full px-6 py-8 flex flex-col gap-8">
        <SkeletonActionCard>
          <div class="flex flex-col w-full items-center p-8">
            <div class="skeleton w-64 h-64"/>
          </div>
        </SkeletonActionCard>
      </div>
    </div>

    <div v-else>
      <StatusBar :step="dashboardState" class="my-4"/>

      <div
          v-if="dashboardState === 1"
          class="w-full px-4 py-8 flex flex-col gap-8"
      >
        <CustomMessage :message="t('onboarding.completed')" type="success"/>
        <ActionCard
            v-if="getProgress() < 100"
            :button-text="t('dashboard.progress.button')"
            card-type="ghost"
            @action-button-clicked="navigateTo('/student/profile')"
        >
          <Progress
              :progress="getProgress()"
              :text="t('dashboard.progress.text')"
          />
        </ActionCard>
        <ActionCard
            v-if="matches"
            :button-text="t('dashboard.student.startMatching')"
            card-type="primary"
            @action-button-clicked="navigate('/student/matching')"
        >
          <div class="flex flex-col w-full items-center p-3">
            <h2 class="text-xl mx-4 py-8">
              {{ t("dashboard.student.findSupervisor") }}
            </h2>
            <CardStack :amount="3" @click="navigate('/student/matching')">
              <SupervisorCard
                  :current-capacity="matches.availableSpots"
                  :description="matches.bio"
                  :first-name="matches.firstName || ''"
                  :image="matches.profileImage"
                  :last-name="matches.lastName || ''"
                  :max-capacity="matches.totalSpots"
                  :similarity-score="
                      Math.round((matches.compatibilityScore as number) * 100)
                    "
                  :tags="matches.tags"
                  name="Hello name"
                  size="xs"
              />
            </CardStack>
          </div>
        </ActionCard>
      </div>

      <div
          v-if="dashboardState === 2"
          class="w-full px-4 py-8 flex flex-col gap-8"
      >
        <ActionCard
            v-if="getProgress() < 100"
            :button-text="t('dashboard.progress.button')"
            card-type="ghost"
            @action-button-clicked="navigateTo('/student/profile')"
        >
          <Progress
              :progress="getProgress()"
              :text="t('dashboard.progress.text')"
          />
        </ActionCard>
        <ActionCard
            :button-text="t('generic.showAll')"
            :header-text="t('dashboard.student.yourRequests')"
            card-type="ghost"
            @action-button-clicked="navigate('/student/requests')"
        >
          <div class="h-64 lg:h-96">
            <div
                class="flex flex-col w-full items-center p-3 overflow-y-auto h-full"
            >
              <div
                  v-for="sentRequest in supervisionRequestsSentByCurrentStudent"
                  :key="sentRequest.id"
                  class="mb-2 w-full"
              >
                <NuxtLink :to="`/profiles/${sentRequest.supervisor.user_id}`">
                  <MiniCard
                      :bottom-text="
                      new Date(sentRequest.updated_at).toLocaleDateString()
                    "
                      :class="{ 'opacity-50': sentRequest.request_state ===
                      supervisionRequestStatus.REJECTED }"
                      :first-name="sentRequest.supervisor.user.first_name"
                      :image="sentRequest.supervisor.user.profile_image"
                      :last-name="sentRequest.supervisor.user.last_name"
                      :preview-text="
                      sentRequest.request_state ===
                      supervisionRequestStatus.REJECTED
                        ? t('generic.rejectedRequestTo') +
                          ' ' +
                          sentRequest.supervisor.user.first_name +
                          ' ' +
                          sentRequest.supervisor.user.last_name
                        : t('generic.pendingRequestTo') +
                          ' ' +
                          sentRequest.supervisor.user.first_name +
                          ' ' +
                          sentRequest.supervisor.user.last_name
                    "
                      top-icon="user-group"
                  />
                </NuxtLink>
              </div>
            </div>
          </div>
        </ActionCard>
      </div>

      <div v-if="dashboardState === 3" class="my-auto mx-auto w-full px-4 py-8">
        <ActionCard
            v-if="getProgress() < 100"
            :button-text="t('dashboard.progress.button')"
            card-type="ghost"
            @action-button-clicked="navigateTo('/student/profile')"
        >
          <Progress
              :progress="getProgress()"
              :text="t('dashboard.progress.text')"
          />
        </ActionCard>
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
          <div class="h-64 flex">
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
                {{ t("dashboard.student.yourSupervisor") }}
              </h2>
            </div>
          </div>
        </ActionCard>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from "~/stores/useUserStore";
import { useSupervisorStore } from "~/stores/useSupervisorStore";
import type { SupervisorData } from "#shared/types/supervisorInterfaces";
import { useStudentStore } from "~/stores/useStudentStore";
import { supervisionRequestStatus } from "#shared/enums/enums";
import Progress from "~/components/Progress/Progress.vue";

const { t } = useI18n();

const { getRecommendedSupervisors } = useUserApi();
const userStore = useUserStore();
const supervisorStore = useSupervisorStore();
const studentStore = useStudentStore();

if (!userStore.user) {await userStore.refetchCurrentUser();}
if (!studentStore.studentProfile) {await studentStore.fetchStudentProfile(userStore.user?.id ?? "");}

const getProgress: number = () => {
  console.log(userStore.user);
  console.log(studentStore.studentProfile?.thesis_description);

  const elements = [
    userStore.user.first_name,
    userStore.user.last_name,
    userStore.user.email,
    userStore.user.profile_image,
    // TODO: this sucks super hard. Make sure this is loaded on the dashboard
    studentStore.studentProfile?.thesis_description,
    // userStore.user.thesis_description
  ];

  let result: number = 0;
  const step: number = 100 / elements.length;

  elements.forEach((element) => {
    if (element && element !== '') {
      result += step;
    }
  });

  return Math.round(result);
}

const isLoading = computed(() => {
  return supervisorStore.supervisors.length === 0 && acceptedSupervisionRequests.value.length === 0;
});

const matches = computed(() => {
  return supervisorStore.supervisors[0]
});

const dashboardState = computed(() => studentStore.dashboardState);
const supervisionRequestsSentByCurrentStudent = computed(() =>
    studentStore.supervisionRequestsSentByCurrentStudent.filter(
        (request) => request.request_state === supervisionRequestStatus.PENDING
    )
);
const acceptedSupervisionRequests = computed(() => studentStore.acceptedSupervisionRequests);

// if for some reason the user has more than one accepted supervision request, we will show a warning
const warning = computed(() => {
  if (acceptedSupervisionRequests.value.length > 1) {
    const namesOfAcceptedSupervisors = acceptedSupervisionRequests.value.map(
        (request) =>
            `${ request.supervisor.user.first_name } ${ request.supervisor.user.last_name }`
    );
    return t("dashboard.student.multipleAcceptedWarning", {
      count: acceptedSupervisionRequests.value.length,
      supervisors: namesOfAcceptedSupervisors.join(", "),
    });
  }
  return "";
});

const warningModalId = computed(() => {
  if (acceptedSupervisionRequests.value.length > 0) {
    return `confirmation-modal-${ acceptedSupervisionRequests.value[0].id }`;
  }
  return "confirmation-modal-warning";
});

onMounted(async () => {
  if (!userStore.user) {
    await userStore.refetchCurrentUser();
  }
  try {
    await Promise.all([
      studentStore.fetchSupervisionRequests(),
      userStore.user ? Promise.resolve() : userStore.refetchCurrentUser()
    ]);
    if (acceptedSupervisionRequests.value.length > 1) {
      const modal = document.getElementById(
          warningModalId.value
      ) as HTMLDialogElement;
      if (modal) {
        modal.showModal();
      } else {
        console.error("Warning modal element not found:", warningModalId.value);
      }
    }
    if (userStore.user) {
      const res = (await getRecommendedSupervisors(
          userStore.user.id
      )) as SupervisorData[];
      supervisorStore.setSupervisors(res);
    }
  } catch (error) {
    console.error("Error fetching supervision requests or user data:", error);
  }
});

watch(
    () => acceptedSupervisionRequests.value.length,
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

function navigate(route: string) {
  navigateTo(route);
}

definePageMeta({
  layout: "student-base-layout",
});
</script>
