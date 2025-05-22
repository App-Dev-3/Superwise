<script setup lang="ts">
import {useStudentStore} from "~/stores/useStudentStore";

const bottomNavButtons = [
    { label: 'Dashboard', icon: 'house', route: '/student/dashboard' },
    { label: 'Matching', icon: 'user-group', route: '/student/matching' },
    { label: 'Requests', icon: 'message', route: '/student/requests' }
]
const studentStore = useStudentStore();

await callOnce(() => studentStore.fetchSupervisionRequests(), { mode: 'navigation' })
const pendingSupervisionRequests = studentStore.pendingSupervisionRequests

function navigate(route: string) {
    navigateTo(route);
}
</script>

<template>
    <div class="flex flex-col items-center px-2 max-w-full">
        <div class="min-h-screen flex flex-col max-w-7xl w-full">
            <AppHeader :show-search="false"/>

            <div class="h-96 lg:h-128">
                <div class="flex flex-col w-full items-center p-3 overflow-y-auto h-full">
                    <div v-for="pendingRequest in pendingSupervisionRequests" :key="pendingRequest.id" class="mb-2 w-full">
                        <MiniCard
                            :image="pendingRequest.supervisor.user.profile_image"
                            :first-name="pendingRequest.supervisor.user.first_name"
                            :last-name="pendingRequest.supervisor.user.last_name"
                            :preview-text="`Pending Request to ${pendingRequest.supervisor.user.first_name}`"
                            top-icon="user-group"
                            bottom-icon="tag"
                            :bottom-text="new Date(pendingRequest.updated_at).toLocaleDateString()"
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

<style scoped>

</style>