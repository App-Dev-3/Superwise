<script lang="ts" setup>
import { ref, watch } from "vue";
import { useUserStore } from "~/stores/useUserStore";
import type { UserData } from "#shared/types/userInterfaces";
import type { SupervisionRequestsData, SupervisorData } from "#shared/types/supervisorInterfaces";
import { useSupervisionRequests } from "~/composables/useSupervisionRequests";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import EmptyPagePlaceholder from "~/components/Placeholder/EmptyPagePlaceholder.vue";
import Progress from "~/components/Progress/Progress.vue";

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const { getUserByEmail } = useUserApi();
const { getSupervisorByUserId } = useSupervisorApi();
const userStore = useUserStore();
const supervisorStore = useSupervisorStore();


const current_user = ref<UserData | null>(null);
const supervisor_data = computed(() => {
  return supervisorStore.supervisors[0] || null;
});
const {
  data: pendingRequests,
} = useSupervisionRequests("PENDING");

function navigate(route: string) {
  navigateTo(route);
}

const visibleCount = ref(3);
const visibleRequests = computed(
    () => supervisorStore.supervisionRequests?.slice(0, visibleCount.value) ?? []
);

watch(
    () => user.value?.primaryEmailAddress?.emailAddress,
    async (email) => {
      if (!email) return;

      if (!userStore.user) {
        const fetched = (await getUserByEmail(email)) as UserData;
        userStore.setUser(fetched);
      }
      current_user.value = userStore.user;

      if (current_user.value?.id) {
        const data = (await getSupervisorByUserId(
            current_user.value.id
        )) as SupervisorData;
        supervisorStore.setSupervisors([ data ]);
      }
    },
    { immediate: true }
);

watch(
    pendingRequests,
    (newVal) => {
      if (newVal) {
        supervisorStore.setSupervisionRequests(newVal as SupervisionRequestsData[]);
      }
    },
    { immediate: true }
);

const { t } = useI18n();


const getProgress: number = () => {
  console.log(userStore.user);

  const elements = [
    userStore.user.first_name,
    userStore.user.last_name,
    userStore.user.email,
    userStore.supervisorProfile.bio,
    userStore.user.profile_image,
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

definePageMeta({
  layout: "supervisor-base-layout",
});
</script>

<template>
  <div class="flex flex-col w-full gap-8 p-8">
    <ActionCard
        v-if="getProgress() < 100"
        :button-text="t('dashboard.progress.button')"
        card-type="ghost"
        @action-button-clicked="navigateTo('/supervisor/profile')"
    >
      <Progress
          :progress="getProgress()"
          :text="t('dashboard.progress.text')"
      />
    </ActionCard>
    <ActionCard
        :button-text="t('dashboard.supervisor.manageStudents')"
        card-type="primary"
        class="w-full text-center"
        @action-button-clicked="navigate('/supervisor/currently-supervising')"
    >
      <div class="py-8 px-16 w-full">
        <h2 class="text-xl">
          <FontAwesomeIcon icon="user-group"/>
          {{
            // this works, even though the IDE tells you it doesnt. The frontend interface types are not consitent with the backend types. Dont ask why.
            (supervisor_data?.total_spots ?? 0) - (supervisor_data?.available_spots ?? 0)
          }}/{{ supervisor_data?.total_spots ?? 0 }}
        </h2>
        <p class="text-md">
          {{ t("dashboard.supervisor.slotsFilled") }}
        </p>
      </div>
    </ActionCard>

    <ActionCard
        :button-text="t('generic.showAll')"
        :disabled="visibleCount >= (pendingRequests?.length ?? 0)"
        :header-text="t('generic.requests')"
        card-type="ghost"
        @action-button-clicked="navigateTo('/supervisor/matching')"
    >
      <EmptyPagePlaceholder
          :render-condition="visibleRequests"
          :text="t('dashboard.supervisor.noRequests')"
      />
      <NuxtLink
          v-for="request in visibleRequests"
          :key="request.id"
          :to="`/profiles/${request.student.user_id}`"
      >
        <MiniCard
            :bottom-text="formatTimeString(request.updated_at, undefined)"
            :first-name="request.student.user.first_name"
            :image="request.student.user.profile_image || getPlaceholderImage(request.student.user.first_name, request.student.user.last_name) || ''"
            :last-name="request.student.user.last_name"
            :preview-text="request.student.thesis_description"
            top-icon="message"
        />
      </NuxtLink>

    </ActionCard>
  </div>
</template>

<style scoped></style>
