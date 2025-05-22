<script setup lang="ts">
import {supervisionRequestStatus} from "#shared/enums/enums";
import type {SupervisionRequest} from "#shared/types/requests";

const acceptedSupervisionRequests = ref<Array<unknown>>([]);

const { data } = useFetch<Array<unknown>>(
    '/api/supervision-requests', {
        params: {
            requestState: supervisionRequestStatus.ACCEPTED
        }
    }
)
watch(data, (newData) => {
    if (newData) {
        acceptedSupervisionRequests.value = newData;
    }
}, { immediate: true })

function navigate(route: string) {
    navigateTo(route);
}

const bottomNavButtons = [
    { label: 'Dashboard', icon: 'house', route: '/supervisor/dashboard' },
    { label: 'Matching', icon: 'user-group', route: '/supervisor/matching' },
    { label: 'Confirmed', icon: 'message', route: '/supervisor/confirmed' }
]
</script>

<template>
    <div class="flex flex-col items-center px-2 max-w-full">
        <div class="min-h-screen flex flex-col max-w-7xl w-full">
            <AppHeader :show-search="false"/>
<!-- // TODO: MAKE THIS WORK-->
            <div v-if="acceptedSupervisionRequests.length" class="h-96 lg:h-128">
                <div class="flex flex-col w-full items-center p-3 overflow-y-auto h-full">
                    <div v-for="acceptedRequest in acceptedSupervisionRequests" :key="pendingRequest.id" class="mb-2 w-full">
                        <MiniCard
                            :image="acceptedRequest?.student?.user?.profile_image ?? ''"
                            :first-name="acceptedRequest?.student?.user?.first_name"
                            :last-name="acceptedRequest?.student?.user?.last_name"
                            :preview-text="`You are supervising ${acceptedRequest?.student?.user?.first_name}`"
                            top-icon="user-group"
                            bottom-icon="tag"
                            :bottom-text="new Date(acceptedRequest.updated_at).toLocaleDateString()"
                        />
                    </div>
                </div>
            </div>
            <div>
                <BottomNav
                    :bottom-nav-buttons="bottomNavButtons"
                    :always-show-labels="false"
                    @navigate="navigate"
                />
            </div>
        </div>
    </div>
</template>
