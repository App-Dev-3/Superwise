<script lang="ts" setup>
import { useStudentStore } from "~/stores/useStudentStore";
import EmptyPagePlaceholder from "~/components/Placeholder/EmptyPagePlaceholder.vue";

const { t } = useI18n();
const studentStore = useStudentStore();

await callOnce(() => studentStore.fetchSupervisionRequests(), { mode: 'navigation' })
const pendingSupervisionRequests = studentStore.pendingSupervisionRequests

function navigate(route: string) {
  navigateTo(route);
}

definePageMeta({
  layout: "student-base-layout",
});
</script>

<template>
  <div class="flex flex-col items-center px-2 max-w-full">
    <div v-if="pendingSupervisionRequests.length" class="flex flex-col max-w-7xl w-full">
      <div class="h-full">
        <div class="flex flex-col w-full items-center p-3 overflow-y-auto h-full">
          <div v-for="pendingRequest in pendingSupervisionRequests" :key="pendingRequest.id" class="mb-2 w-full">
            <MiniCard
                :bottom-text="new Date(pendingRequest.updated_at).toLocaleDateString()"
                :first-name="pendingRequest.supervisor.user.first_name"
                :image="pendingRequest.supervisor.user.profile_image"
                :last-name="pendingRequest.supervisor.user.last_name"
                :preview-text="`Pending Request to ${pendingRequest.supervisor.user.first_name}`"
                bottom-icon="tag"
                top-icon="user-group"
                class="cursor-pointer"
                @click="navigate(`/profiles/${pendingRequest.supervisor.user_id}`)"
            />
          </div>
        </div>
      </div>
    </div>
      <div v-else class="size-full flex flex-col justify-center items-center">
          <EmptyPagePlaceholder
              :text="t('requests.noRequests')"
          />
      </div>
  </div>
</template>

<style scoped>

</style>