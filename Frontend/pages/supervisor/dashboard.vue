<script lang="ts" setup>
import { ref, watch } from "vue";
import { useUserStore } from "~/stores/useUserStore";
import type { UserData } from "#shared/types/userInterfaces";
import type { SupervisorData } from "#shared/types/supervisorInterfaces";
import { useSupervisionRequests } from "~/composables/useSupervisionRequests";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const { user } = useUser();
const { getUserByEmail } = useUserApi();
const { getSupervisorByUserId } = useSupervisorApi();
const userStore = useUserStore();

const current_user = ref<UserData | null>(null);
const supervisor_data = ref<SupervisorData | null>(null);

const {
  data: pendingRequests,
  pending,
  error,
} = useSupervisionRequests("PENDING");

function navigate(route: string) {
  navigateTo(route);
}

const visibleCount = ref(3);
const visibleRequests = computed(
  () => pendingRequests.value?.slice(0, visibleCount.value) ?? []
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
      supervisor_data.value = (await getSupervisorByUserId(
        current_user.value.id
      )) as SupervisorData;
    }
  },
  { immediate: true }
);

const { t } = useI18n();

const bottomNavButtons = [
  {
    label: t("nav.dashboard"),
    icon: "house",
    route: "/supervisor/dashboard",
  },
  {
    label: t("nav.matching"),
    icon: "user-group",
    route: "/supervisor/matching",
  },
  {
    label: t("nav.confirmed"),
    icon: "message",
    route: "/supervisor/confirmed",
  },
];
</script>

<template>
  <div class="flex flex-col items-center px-2 max-w-full">
    <div class="min-h-screen flex flex-col max-w-7xl w-full">
      <AppHeader
        :first-name="current_user?.first_name"
        :image="
          current_user?.profile_image === null
            ? ''
            : current_user?.profile_image
        "
        :last-name="current_user?.last_name"
        :role="current_user?.role || ''"
        show-search
        show-user
      />

      <div>
        <ActionCard
          :button-text="t('dashboard.supervisor.manageStudents')"
          card-type="primary"
          class="mx-auto text-center my-16"
          @action-button-clicked="navigate('/supervisor/currently-supervising')"
        >
          <div class="py-8 px-16">
            <h2 class="text-xl">
              <FontAwesomeIcon icon="user-group" />
              {{
                // this works, even though the IDE tells you it doesnt. The frontend interface types are not consitent with the backend types. Dont ask why.
                supervisor_data?.total_spots - supervisor_data?.available_spots
              }}/{{ supervisor_data?.total_spots }}
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
          <div v-if="pending">Loading…</div>
          <div v-else-if="error">Error: {{ error.message }}</div>
          <MiniCard
            v-for="request in visibleRequests"
            v-else
            :key="request.id"
            :bottom-text="formatTimeString(request.updated_at, undefined)"
            :first-name="request.student.user.first_name"
            :last-name="request.student.user.last_name"
            :preview-text="request.student.thesis_description"
            image=""
            top-icon="message"
          />
        </ActionCard>

        <BottomNav
          :always-show-labels="false"
          :bottom-nav-buttons="bottomNavButtons"
          @navigate="navigate"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
