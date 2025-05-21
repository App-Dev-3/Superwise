import type { SupervisionRequestsData, SupervisorData } from "~/shared/types/supervisorInterfaces"

const STORAGE_KEY = 'app_supervisor_store'

export const useSupervisorStore = defineStore('supervisorStore', {
  state: () => {
    const fromStorage = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '{}'
    ) as {
      supervisors?: SupervisorData[]
      supervisionRequests?: SupervisionRequestsData[] | null
    }

    return {
      supervisors: fromStorage.supervisors || [] as SupervisorData[],
      supervisionRequests:
        fromStorage.supervisionRequests ?? (null as SupervisionRequestsData[] | null),
    }
  },

  actions: {
    /** private persist helper */
    _persist() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          supervisors: this.supervisors,
          supervisionRequests: this.supervisionRequests,
        })
      )
    },

    setSupervisors(supervisors: SupervisorData[]) {
      this.supervisors = supervisors

      this._persist();
    },
    setSupervisionRequests(supervisionRequests: SupervisionRequestsData[]) {
      this.supervisionRequests = supervisionRequests

      this._persist();
    },
    clearSupervisors() {
      this.supervisors = []

      this._persist();
    },

    removeSupervisor(supervisorId: string) {
      this.supervisors = this.supervisors.filter(supervisor => supervisor.supervisor_userId !== supervisorId)

      this._persist();
    },
    removeSupervisionRequest(supervisionRequestId: string) {
      this.supervisionRequests = this.supervisionRequests?.filter(request => request.id !== supervisionRequestId) || null

      this._persist();
    },

    addSupervisor(supervisor: SupervisorData) {
      if (this.supervisors.some(existingSupervisor => existingSupervisor.supervisor_userId === supervisor.supervisor_userId)) {
        this.removeSupervisor(supervisor.supervisor_userId)
      }
      this.supervisors.push(supervisor)

      this._persist();
    },
    addSupervisionRequest(supervisionRequest: SupervisionRequestsData) {
      if (this.supervisionRequests?.some(existingRequest => existingRequest.id === supervisionRequest.id)) {
        this.removeSupervisionRequest(supervisionRequest.id)
      }
      this.supervisionRequests = this.supervisionRequests || []
      this.supervisionRequests.push(supervisionRequest)

      this._persist();
    },
  }
})