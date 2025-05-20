import type {UserRegistrationData} from "~/shared/types/userInterfaces";

const { getUserRegistrationStatus } = useUserApi();

export const useRegistrationStore = defineStore('registration', {
  state: () => ({
    status: null as UserRegistrationData | null,
  }),
  actions: {
    async fetchRegistrationStatus(userEmail: string) {
      try {
        this.status = await getUserRegistrationStatus(userEmail);
      } catch (e) {
        console.error('Failed to fetch onboarding status:', e)
      }
    }
  }
})