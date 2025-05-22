import type {SupervisionRequestsData} from "#shared/types/supervisorInterfaces";
import {HttpMethods, supervisionRequestStatus} from "#shared/enums/enums";
import type {StudentProfile} from "#shared/types/StudentInterfaces";

export const useStudentStore = defineStore('student', () => {
    const supervisionRequestsSentByCurrentStudent = ref<SupervisionRequestsData[]>([])
    const acceptedSupervisionRequests = ref<SupervisionRequestsData[]>([])
    const pendingSupervisionRequests = ref<SupervisionRequestsData[]>([])
    const dashboardState = ref<number>(1)

    const studentProfile = ref<StudentProfile | null>(null)

    const fetchSupervisionRequests = async () => {
        try {
            supervisionRequestsSentByCurrentStudent.value = await $fetch<SupervisionRequestsData[]>('/api/supervision-requests', {
                method: HttpMethods.GET,
                headers: {
                    'Accept': 'application/json',
                },
            })
        } catch (error) {
            console.error(error)
        }
    }

    watch(supervisionRequestsSentByCurrentStudent, () => {
        if (supervisionRequestsSentByCurrentStudent.value.length > 0) {
            acceptedSupervisionRequests.value = supervisionRequestsSentByCurrentStudent.value.filter((request) => {
                return request.request_state === supervisionRequestStatus.ACCEPTED
            })
        } else {
            acceptedSupervisionRequests.value = []
        }
    },{ immediate: true })

    watch(acceptedSupervisionRequests, () => {
        if (acceptedSupervisionRequests.value.length > 0) {
            dashboardState.value = 3
        } else if (supervisionRequestsSentByCurrentStudent.value.length > 0) {
            dashboardState.value = 2
        } else {
            dashboardState.value = 1
        }
    },{ immediate: true })

    watch(supervisionRequestsSentByCurrentStudent, () => {
        if (supervisionRequestsSentByCurrentStudent.value.length > 0) {
            pendingSupervisionRequests.value = supervisionRequestsSentByCurrentStudent.value.filter((request) => {
                return request.request_state === supervisionRequestStatus.PENDING
            })
        } else {
            pendingSupervisionRequests.value = []
        }
    },{ immediate: true })

    const fetchStudentProfile = async (userId: string) => {
        try {
            studentProfile.value = await $fetch<StudentProfile>(`/api/students/user/${userId}`, {
                method: HttpMethods.GET,
                headers: {
                    'Accept': 'application/json',
                },
            })
            console.log("FETCHED STUDENT PROFILE: ", studentProfile.value)
        } catch (error) {
            console.error(error)
        }
    }

    return {
        supervisionRequestsSentByCurrentStudent,
        fetchSupervisionRequests,
        acceptedSupervisionRequests,
        pendingSupervisionRequests,
        dashboardState,
        studentProfile,
        fetchStudentProfile
    }
})