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
  }
},
})