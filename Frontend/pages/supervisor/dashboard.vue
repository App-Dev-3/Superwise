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

const bottomNavButtons = [
    { label: 'Dashboard', icon: 'house', route: '/supervisor/dashboard' },
    { label: 'Matching', icon: 'user-group', route: '/supervisor/matching' },
    { label: 'Confirmed', icon: 'message', route: '/supervisor/confirmed' }
]
</script>

<template>
  <div class="flex flex-col items-center px-2 max-w-full">
    <div class="min-h-screen flex flex-col max-w-7xl w-full">
      <AppHeader
        show-search
        show-user
        :image="
          current_user?.profile_image === null
            ? ''
            : current_user?.profile_image
        "
        :first-name="current_user?.first_name"
        :last-name="current_user?.last_name"
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
              {{
                // this works, even though the IDE tells you it doesnt. The frontend interface types are not consitent with the backend types. Dont ask why.
                supervisor_data?.total_spots - supervisor_data?.available_spots
              }}/{{ supervisor_data?.total_spots }}
            </h2>
            <p class="text-md">Slots filled</p>
          </div>
        </ActionCard>

        <ActionCard
          header-text="Requests"
          button-text="Show all"
          :disabled="visibleCount >= (pendingRequests?.length ?? 0)"
          card-type="ghost"
          @action-button-clicked="navigateTo('/supervisor/matching')"
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
            :bottom-text="formatTimeString(request.updated_at, undefined)"
          />
        </ActionCard>

          <BottomNav
              :bottom-nav-buttons="bottomNavButtons"
              :always-show-labels="false"
              @navigate="navigate"
          />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
