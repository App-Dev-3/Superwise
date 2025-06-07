<script lang="ts" setup>
import { supervisionRequestStatus } from '#shared/enums/enums';
import EmptyPagePlaceholder from "~/components/Placeholder/EmptyPagePlaceholder.vue";

const acceptedSupervisionRequests = ref<Array<unknown>>([]);

const { data } = useFetch<Array<unknown>>('/api/supervision-requests', {
  query: {
    request_state: supervisionRequestStatus.ACCEPTED,
  },
});
watch(
    data,
    (newData) => {
      if (newData) {
        acceptedSupervisionRequests.value = newData;
      }
    },
    { immediate: true },
);


const { t } = useI18n();

definePageMeta({
  layout: "supervisor-base-layout",
});
</script>

<template>
  <div
      class="flex flex-col size-full p-6"
  >
    <div
        v-if="acceptedSupervisionRequests.length"
        class="flex flex-col items-center p-3 overflow-y-auto size-full"
    >
      <div
          v-for="acceptedRequest in acceptedSupervisionRequests"
          :key="acceptedRequest.id"
          class="mb-2 w-full"
      >
        <MiniCard
            :bottom-text="
								t(
									'confirmed.confirmedOn',
									{
										date: new Date(
											acceptedRequest.updated_at,
										).toLocaleDateString(),
									},
								)
							"
            :first-name="
								acceptedRequest
									?.student
									?.user
									?.first_name
							"
            :image="
								acceptedRequest
									?.student
									?.user
									?.profile_image ??
								''
							"
            :last-name="
								acceptedRequest
									?.student
									?.user
									?.last_name
							"
            :preview-text="
								t(
									'confirmed.supervising',
									{
										firstName: acceptedRequest
											?.student
											?.user
											?.first_name,
									},
								)
							"
            bottom-icon="tag"
            top-icon="user-group"
        />
      </div>
    </div>
    <EmptyPagePlaceholder
        v-else
        :text="t('confirmed.noStudents')"
    />
  </div>
</template>
