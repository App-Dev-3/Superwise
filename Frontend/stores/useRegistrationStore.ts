import type { UserRegistrationData } from "~/shared/types/userInterfaces";
import { UserRoles } from "#shared/enums/enums";

const { getUserRegistrationStatus } = useUserApi();

const STORAGE_KEY = 'app_registration'

export const useRegistrationStore = defineStore('registration', {
  state: () => ({
    status: JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as
      | UserRegistrationData
      | null,
  }),
  actions: {
    async fetchRegistrationStatus(userEmail?: string) {
      if (!userEmail) {
        this.status = {
          exists: false,
          is_registered: false,
          role: UserRoles.STUDENT
        } as UserRegistrationData;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.status))
        return;
      }
      try {
        this.status = await getUserRegistrationStatus(userEmail);
        localStorage.removeItem(STORAGE_KEY)
      } catch (e) {
        console.error('Failed to fetch onboarding status:', e)
      }
    }
  }
})