<script lang="ts" setup>
import { supervisionRequestStatus } from '#shared/enums/enums';

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

function navigate(route: string) {
  navigateTo(route);
}

const { t } = useI18n();

const bottomNavButtons = [
  {
    label: t('nav.dashboard'),
    icon: 'house',
    route: '/supervisor/dashboard',
  },
  {
    label: t('nav.matching'),
    icon: 'user-group',
    route: '/supervisor/matching',
  },
  {
    label: t('nav.confirmed'),
    icon: 'message',
    route: '/supervisor/confirmed',
  },
];
</script>

<template>
  <div class="flex flex-col items-center px-2 max-w-full">
    <div class="min-h-screen flex flex-col max-w-7xl w-full">
      <AppHeader :show-search="false"/>
      <div
          v-if="acceptedSupervisionRequests.length"
          class="h-96 lg:h-128"
      >
        <div
            class="flex flex-col w-full items-center p-3 overflow-y-auto h-full"
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
      </div>
      <div>
        <BottomNav
            :bottom-nav-buttons="bottomNavButtons"
            @navigate="navigate"
        />
      </div>
    </div>
  </div>
</template>
