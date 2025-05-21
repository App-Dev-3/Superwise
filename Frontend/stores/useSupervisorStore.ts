import type { SupervisionRequestsData, SupervisorData } from "~/shared/types/supervisorInterfaces"

export const useSupervisorStore = defineStore('supervisorStore', {
state: () => ({
  supervisors: [] as SupervisorData[],
  supervisionRequests: [] as SupervisionRequestsData[] | null,
}),

actions: {
  setSupervisors(supervisors: SupervisorData[]) {
    this.supervisors = supervisors
  },
  setSupervisionRequests(supervisionRequests: SupervisionRequestsData[]) {
    this.supervisionRequests = supervisionRequests
  },
  clearSupervisors() {
    this.supervisors = []
  },

  removeSupervisor(supervisorId: string) {
    this.supervisors = this.supervisors.filter(supervisor => supervisor.supervisor_userId !== supervisorId)
  },
  removeSupervisionRequest(supervisionRequestId: string) {
    this.supervisionRequests = this.supervisionRequests?.filter(request => request.id !== supervisionRequestId) || null
  },
  
  addSupervisor(supervisor: SupervisorData) {
    if (this.supervisors.some(existingSupervisor => existingSupervisor.supervisor_userId === supervisor.supervisor_userId)) {
      this.removeSupervisor(supervisor.supervisor_userId)
    }
    this.supervisors.push(supervisor)
  },
  addSupervisionRequest(supervisionRequest: SupervisionRequestsData) {
    if (this.supervisionRequests?.some(existingRequest => existingRequest.id === supervisionRequest.id)) {
      this.removeSupervisionRequest(supervisionRequest.id)
    }
    this.supervisionRequests = this.supervisionRequests || []
    this.supervisionRequests.push(supervisionRequest)
  },
}
})