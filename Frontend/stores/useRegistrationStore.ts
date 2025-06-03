import type {UserRegistrationData} from "~/shared/types/userInterfaces";
import {UserRoles} from "#shared/enums/enums";

const { getUserRegistrationStatus } = useUserApi();

export const useRegistrationStore = defineStore('registration', {
  state: () => ({
    status: null as UserRegistrationData | null,
  }),
  actions: {
    async fetchRegistrationStatus(userEmail?: string) {
        if (!userEmail) {
          this.status = {
            exists: false,
            is_registered: false,
            role: UserRoles.STUDENT
          } as UserRegistrationData;
          return;
        }
      try {
        this.status = await getUserRegistrationStatus(userEmail);
      } catch (e) {
        console.error('Failed to fetch onboarding status:', e)
      }
    }
  }
})