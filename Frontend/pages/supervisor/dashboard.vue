<script setup lang="ts">
import { ref, watch } from "vue";
import { useUserStore } from "~/stores/useUserStore";
import type { UserData } from "#shared/types/userInterfaces";
import type { SupervisorData } from "#shared/types/supervisorInterfaces";
import { useSupervisionRequests } from "~/composables/useSupervisionRequests";

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

const dummyRoute = ref("/");

const bottomNavButtons = [
  { label: "Dashboard", icon: "house", route: "/supervisor/dashboard" },
  { label: "Requests", icon: "user-group", route: "/supervisor/requests" },
];

function navigate(route: string) {
  dummyRoute.value = route;
  navigateTo(route);
}

const visibleCount = ref(3);
const visibleRequests = computed(
  () => pendingRequests.value?.slice(0, visibleCount.value) ?? []
);

function loadMore() {
  visibleCount.value += 3;
}

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
      const sup = (await getSupervisorByUserId(
        current_user.value.id
      )) as SupervisorData;
      supervisor_data.value = sup;
      console.log(sup);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="flex flex-col items-center px-2 max-w-full">
    <div class="min-h-screen flex flex-col max-w-7xl w-full">
      <AppHeader
        show-search
        show-user
        :image="current_user.profile_image"
        :first-name="current_user.first_name"
        :last-name="current_user.last_name"
      />

      <div>
        <ActionCard
          button-text="Update Capacity"
          card-type="primary"
          class="mx-auto text-center my-16"
          @action-button-clicked="navigate('/supervisor/currently-supervising')"
        >
          <div class="py-8 px-16">
            <h2 class="text-xl">
              <FontAwesomeIcon icon="user-group" />
              {{ supervisor_data?.available_spots }}/{{
                supervisor_data?.total_spots
              }}
            </h2>
            <p class="text-md">Capacity</p>
          </div>
        </ActionCard>

        <ActionCard
          header-text="Requests"
          :button-text="
            visibleCount < (pendingRequests?.length ?? 0)
              ? 'Show more…'
              : 'End of requests'
          "
          :disabled="visibleCount >= (pendingRequests?.length ?? 0)"
          card-type="ghost"
          @action-button-clicked="loadMore"
        >
          <div v-if="pending">Loading…</div>
          <div v-else-if="error">Error: {{ error.message }}</div>
          <MiniCard
            v-for="request in visibleRequests"
            v-else
            :key="request.id"
            image=""
            :first-name="request.student.user.first_name"
            :last-name="request.student.user.last_name"
            :preview-text="request.student.thesis_description"
            top-icon="message"
            :bottom-text="formatTimeString(request.updated_at)"
            class="hover:bg-blue-300"
          />
        </ActionCard>

        <BottomNav
          :active-route="dummyRoute"
          :always-show-labels="false"
          :bottom-nav-buttons="bottomNavButtons"
          @navigate="navigate"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>