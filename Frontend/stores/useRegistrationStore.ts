import type {UserRegistrationData} from "~/shared/types/userInterfaces";
import {UserRoles} from "#shared/enums/enums";

const { getUserRegistrationStatus } = useUserApi();

export const useRegistrationStore = defineStore('registration', () => {
  const status = ref<UserRegistrationData | null>(null)
  const defaultValue: UserRegistrationData = {
    exists: false,
    is_registered: false,
    role: UserRoles.STUDENT,
    tags: false
  }

  const fetchRegistrationStatus = async (userEmail?: string) => {
    if (!userEmail) {
      status.value = defaultValue
      return;
    }
    try {
      status.value = await getUserRegistrationStatus(userEmail);
    } catch (e) {
        console.error('Failed to fetch registration status:', e);
        status.value = null
    }
  }
  return {
    status,
    fetchRegistrationStatus
  }
})