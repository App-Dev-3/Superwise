import type { SupervisorData } from "~/shared/types/supervisorInterfaces"

export const useSupervisorStore = defineStore('supervisorStore', {
state: () => ({
  supervisors: [] as SupervisorData[],
}),

actions: {
  setSupervisors(supervisors: SupervisorData[]) {
    this.supervisors = supervisors
  },
  clearSupervisors() {
    this.supervisors = []
  },
  removeSupervisor(supervisorId: string) {
    this.supervisors = this.supervisors.filter(supervisor => supervisor.supervisor_userId !== supervisorId)
  },
  addSupervisor(supervisor: SupervisorData) {
    if (this.supervisors.some(existingSupervisor => existingSupervisor.supervisor_userId === supervisor.supervisor_userId)) {
      this.removeSupervisor(supervisor.supervisor_userId)
    }
    this.supervisors.push(supervisor)
  }
},
})