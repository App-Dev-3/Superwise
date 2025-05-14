import type { UserRegistrationData } from "~/shared/types/userInterfaces";

const { getUserRegistrationStatus} = useUserApi();

export const useRegistrationStore = defineStore('registration', {
  state: () => ({
    status: null as UserRegistrationData | null,
  }),
  actions: {
    async fetchRegistrationStatus(userEmail: string) {
      if (this.status !== null) return

      try {
        const res = await getUserRegistrationStatus( userEmail );
        this.status = res;
      } catch (e) {
        console.error('Failed to fetch onboarding status:', e)
      }
    }
  }
})
