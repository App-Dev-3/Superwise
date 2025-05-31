<template>
    <div class="w-full h-full box-border">
        <AppHeader
            show-search
            show-user
            role="Admin"
            image=""
            first-name="Admin"
            last-name=""
        />

        <div class="w-full h-full overflow-y-auto flex flex-col px-6 py-8 gap-4">

            <div class="rounded-3xl bg-base-100 shadow-lg flex flex-col  border border-base-300 ">
                <div class="p-8 gap-4 admin-overview-grid">
                    <FontAwesomeIcon
                        class="opacity-75"
                        icon="user"
                    />
                    <span class="text-body text-primary">{{registeredSupervisorsAmount}}/{{allSupervisorsAmount}}</span>
                    <span class="text-x-small opacity-50">Supervisors are using the app</span>

                    <FontAwesomeIcon
                        class="opacity-75"
                        icon="user-group"
                    />
                    <span class="text-body text-primary">{{ availableSpots }}/{{ totalSpots }}</span>
                    <span class="text-x-small opacity-50">Available spots</span>
                </div>


                <hr class="border-base-300">
                <div class="p-8 gap-4 admin-overview-grid">
                    <FontAwesomeIcon
                        class="opacity-75"
                        icon="user-group"
                    />
                    <span class="text-body text-primary">{{acceptedSupervisionRequestsCount}}/{{ amountOfStudents }}</span>
                    <span class="text-x-small opacity-50">students have a supervisor</span>

                    <FontAwesomeIcon
                        class="opacity-75"
                        icon="user-group"
                    />
                    <span class="text-body text-primary">{{pendingSupervisionRequestsCount}}</span>
                    <span class="text-x-small opacity-50">are currently waiting for supervision approval</span>
                </div>
            </div>

            <CustomButton
                color="info"
                left-icon="cloud-upload-alt"
                text="Import Data"
                wide
                @click="navigateTo('/admin/upload')"
            />

            <CustomButton
                color="success"
                left-icon="file-download"
                text="Export Data"
                wide
                @click="navigateTo('/admin/download')"
            />

<!--            <CustomButton-->
<!--                color="error"-->
<!--                left-icon="trash-can"-->
<!--                text="Delete Data"-->
<!--                wide-->
<!--                @click="navigateTo('/admin/delete')"-->
<!--            />-->
        </div>
    </div>
</template>

<script lang="ts" setup>
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {supervisionRequestStatus, UserRoles} from "#shared/enums/enums";
import type {UserData} from "#shared/types/userInterfaces";
import type {SupervisorProfile} from "#shared/types/supervisorInterfaces";
import type {SupervisionRequest} from "#shared/types/requests";
import type {StudentProfile} from "#shared/types/StudentInterfaces";

definePageMeta({
    layout: "default",
});
const allUsers = ref<UserData[]>([]);
const allSupervisorsAmount = ref(0);
const registeredSupervisorsAmount = ref(0);
const totalSpots = ref(0);
const availableSpots = ref(0);
const amountOfStudents = ref(0);
const acceptedSupervisionRequestsCount = ref(0);
const pendingSupervisionRequestsCount = ref(0);

onMounted(async () => {
    await getSupervisorInfo();
    await getAvailableSpots();
    await getAmountOfStudentsThatHaveASupervisorAndRequestStates();
});

const getSupervisorInfo = async () => {
    const { data, error } = await useFetch<UserData[]>('/api/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });

    if (error.value) {
        console.error("Error fetching supervisors:", error.value);
        return;
    }
    allUsers.value = data.value || [];
    const allSupervisors = data.value?.filter((user) => user.role === UserRoles.SUPERVISOR);
    const registeredSupervisors = allSupervisors?.filter((user) => user.is_registered);
    allSupervisorsAmount.value = allSupervisors?.length || 0;
    registeredSupervisorsAmount.value = registeredSupervisors?.length || 0;
};

const getAvailableSpots = async () => {
    const allSupervisorProfiles = await $fetch<SupervisorProfile[]>('/api/supervisors', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });
    console.log("all supervisors:");
    console.log(allSupervisorProfiles);
    totalSpots.value = allSupervisorProfiles.reduce((acc: number, supervisor: SupervisorProfile) => {
        return acc + supervisor.total_spots;
    }, 0) || 0;

    availableSpots.value = allSupervisorProfiles.reduce((acc: number, supervisor: SupervisorProfile) => {
        return acc + supervisor.available_spots;
    }, 0) || 0;
}

const getAmountOfStudentsThatHaveASupervisorAndRequestStates = async () => {
    const allStudents = await $fetch<StudentProfile[]>('/api/students', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });
    amountOfStudents.value = allStudents.length
    const acceptedRequests = await $fetch<SupervisionRequest[]>('/api/supervision-requests', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        query : {
            request_state: supervisionRequestStatus.ACCEPTED,
        },
    });
    acceptedSupervisionRequestsCount.value = acceptedRequests.length || 0;

    const pendingSupervisionRequests = await $fetch<SupervisionRequest[]>('/api/supervision-requests', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        query : {
            request_state: supervisionRequestStatus.PENDING,
        },
    })
    pendingSupervisionRequestsCount.value = pendingSupervisionRequests.length || 0;
}
</script>

<style scoped>
.admin-overview-grid {
    display: grid;
    grid-template-columns: auto auto 1fr;
    grid-template-rows: repeat(2, 1fr);
    align-items: baseline;
}

.admin-overview-grid > :nth-child(3n-1) {
    text-align: right;
}

</style>