<script lang="ts" setup>
import { useStudentStore } from "~/stores/useStudentStore";
import EmptyPagePlaceholder from "~/components/Placeholder/EmptyPagePlaceholder.vue";

const { t } = useI18n();
const studentStore = useStudentStore();

const { pendingSupervisionRequests, rejectedSupervisionRequests } = storeToRefs(studentStore)

onMounted(() => {
  studentStore.fetchSupervisionRequests()
})

function navigate(route: string) {
  navigateTo(route);
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
        @click="navigate(`/profiles/${pendingRequest.supervisor.user_id}`)"
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
  </div>
</template>

<style scoped>

</style>