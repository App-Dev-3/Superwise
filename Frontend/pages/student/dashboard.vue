<template>
    <div class="flex flex-col items-center px-2 max-w-full">
        <div class="min-h-screen flex flex-col max-w-7xl w-full">
            <AppHeader show-search show-user />
            <StatusBar :step="dashboardState" class="mt-4" />

            <div v-if="dashboardState === 1" class="my-auto mx-auto max-w-7xl w-full p-12">
                <ActionCard
                    v-if="matches.length"
                    button-text="Start Matching!"
                    card-type="primary"
                    @action-button-clicked="navigate('/student/matching')"
                >
                    <div class="flex flex-col w-full items-center p-3">
                        <h2 class="text-xl mx-4 py-8">Find your supervisor now!</h2>
                        <CardStack :amount="3">
                            <SupervisorCard
                                size="sm"
                                :first-name="matches[0].firstName || ''"
                                :last-name="matches[0].lastName || ''"
                                :tags="matches[0].tags"
                                :current-capacity="matches[0].availableSpots"
                                :max-capacity="matches[0].totalSpots"
                                :similarity-score="Math.round(matches[0].compatibilityScore * 100)"
                                name="Hello name"
                                :image="matches[0].profileImage"
                                :description="matches[0].bio"
                            />
                        </CardStack>
                    </div>
                </ActionCard>
            </div>

            <div v-if="dashboardState === 2" class="my-auto mx-auto max-w-7xl w-full p-12 flex flex-col gap-8">
                <ActionCard header-text="Your Requests" button-text="Show all..." card-type="ghost" @action-button-clicked="navigate('/student/requests')">
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
                </ActionCard>
                <ActionCard
                    v-if="matches.length"
                    header-text="Suggested Matches"
                    button-text="Start Matching!"
                    card-type="primary"
                    @action-button-clicked="navigateTo('/student/matching')">
                    <div class="flex flex-col w-full items-center p-3">
                        <CardStack :amount="3">
                            <SupervisorCard
                                size="sm"
                                :first-name="matches[0].firstName || ''"
                                :last-name="matches[0].lastName || ''"
                                :tags="matches[0].tags"
                                :current-capacity="matches[0].availableSpots"
                                :max-capacity="matches[0].totalSpots"
                                :similarity-score="Math.round(matches[0].compatibilityScore * 100)"
                                name="Hello name"
                                :image="matches[0].profileImage"
                                :description="matches[0].bio"
                            />
                        </CardStack>
                    </div>
                </ActionCard>
            </div>

            <div v-if="dashboardState === 3" class="my-auto mx-auto max-w-7xl w-full p-12">
                <ConfirmationExport
                    :canvas-id="'confirmation-canvas-'+acceptedSupervisionRequests[0].id"
                    :student-name="acceptedSupervisionRequests[0].student.user.first_name + ' ' + acceptedSupervisionRequests[0].student.user.last_name"
                    :student-email="acceptedSupervisionRequests[0].student.user.email"
                    :supervisor-name="acceptedSupervisionRequests[0].supervisor.user.first_name + ' ' + acceptedSupervisionRequests[0].supervisor.user.last_name"
                    :supervisor-email="acceptedSupervisionRequests[0].supervisor.user.email"
                    :accepted-date="acceptedSupervisionRequests[0].updated_at"
                />

                <ConfirmationModal
                    :linked-component-id="warningModalId"
                    headline="Warning - Multiple Supervisors"
                    icon="triangle-exclamation"
                    :description="warning"
                    confirm-button-text="OK"
                    confirm-button-color="warning"
                    hide-cancel-button
                />

                <ActionCard button-text="Download Confirmation" card-type="primary" @action-button-clicked="downloadImageFromCanvas('confirmation-canvas-'+acceptedSupervisionRequests[0].id)">
                    <div class="h-96 flex">
                        <div class="flex flex-col w-full items-center justify-center p-3">
                            <Avatar
                                :src="acceptedSupervisionRequests[0].supervisor.user.profile_image"
                                alt="Profile Picture of {{ acceptedSupervisionRequests[0].supervisor.user.first_name }} {{ acceptedSupervisionRequests[0].supervisor.user.last_name }}"
                                size="xl"
                                shape="circle"
                                ring-color="success"
                                :first-name="acceptedSupervisionRequests[0].supervisor.user.first_name"
                                :last-name="acceptedSupervisionRequests[0].supervisor.user.last_name"
                            />
                            <h2 class="text-xl mx-4 py-8 text-center">
                                {{acceptedSupervisionRequests[0].supervisor.user.first_name}}
                                {{acceptedSupervisionRequests[0].supervisor.user.last_name}} is your supervisor!
                            </h2>
                        </div>
                    </div>
                </ActionCard>
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

<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "~/stores/useUserStore";
import { useSupervisorStore } from "~/stores/useSupervisorStore";
import type { UserData } from "#shared/types/userInterfaces";
import type { SupervisorData } from "#shared/types/supervisorInterfaces";
import {useStudentStore} from "~/stores/useStudentStore";

const bottomNavButtons = [
    { label: 'Dashboard', icon: 'house', route: '/student/dashboard' },
    { label: 'Matching', icon: 'user-group', route: '/student/matching' },
    { label: 'Chat', icon: 'message', route: '/student/chat' }
]
const { user } = useUser();
const { getUserByEmail, getRecommendedSupervisors} = useUserApi();
const userStore = useUserStore();
const supervisorStore = useSupervisorStore();
const studentStore = useStudentStore();

await callOnce(() => studentStore.fetchSupervisionRequests(), { mode: 'navigation' })
const dashboardState = studentStore.dashboardState
const pendingSupervisionRequests = studentStore.pendingSupervisionRequests
const acceptedSupervisionRequests = studentStore.acceptedSupervisionRequests

// if for some reason the user has more than one accepted supervision request, we will show a warning
const warning = computed(() => {
    if (acceptedSupervisionRequests.length > 1) {
        const namesOfAcceptedSupervisors = acceptedSupervisionRequests.map(
            request => `${request.supervisor.user.first_name} ${request.supervisor.user.last_name}`
        );
        return `You accepted ${acceptedSupervisionRequests.length} supervision requests, but you only need one supervisor. Please talk to ${namesOfAcceptedSupervisors.join(", ")} and resolve the conflict.`;
    }
    return "";
});

const warningModalId = computed(() => {
    if (acceptedSupervisionRequests.length > 0) {
        return `confirmation-modal-${acceptedSupervisionRequests[0].id}`;
    }
    return "confirmation-modal-warning";
});

onMounted(() => {
    // Give the DOM time to fully render before trying to access the modal
    setTimeout(() => {
        if (acceptedSupervisionRequests.length > 1) {
            const modal = document.getElementById(warningModalId.value) as HTMLDialogElement;
            if (modal) {
                modal.showModal();
            } else {
                console.error("Warning modal element not found:", warningModalId.value);
            }
        }
    }, 500); // Small delay to ensure DOM is ready
});

watch(() => acceptedSupervisionRequests.length, (newLength) => {
    if (newLength > 1) {
        nextTick(() => {
            setTimeout(() => {
                const modal = document.getElementById(warningModalId.value) as HTMLDialogElement;
                if (modal) {
                    modal.showModal();
                } else {
                    console.error("Modal element not found:", warningModalId.value);
                }
            }, 100);
        });
    }
}, { immediate: true });

const matches = ref([] as SupervisorData[]);

if (!userStore.user && user.value?.primaryEmailAddress?.emailAddress) {
    const res = (await getUserByEmail(
        user.value?.primaryEmailAddress.emailAddress
    )) as UserData;
    userStore.setUser(res);
}

if (userStore.user !== null) {
  const res = await getRecommendedSupervisors(userStore.user.id) as SupervisorData[];
  supervisorStore.setSupervisors(res);
  matches.value = res;
}

function navigate(route: string) {
    dummyRoute.value = route;
    navigateTo(route);
}

const dummyRoute = ref("/");
</script>
