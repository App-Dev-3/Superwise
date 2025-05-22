import { defineStore } from 'pinia'
import type { UserData } from '~/shared/types/userInterfaces'
import {HttpMethods} from "#shared/enums/enums";
import type {SupervisorData} from "#shared/types/supervisorInterfaces";

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as UserData | null,
    supervisorProfile: null as SupervisorData | null,
  }),
  actions: {
    setUser(userData: UserData) {
      this.user = userData
    },
    clearUser() {
      this.user = null
    },
    // Keeps the user data in sync with the server. If the user is not logged in, it clears the user data.
    async refetchCurrentUser() {
      const { data, error } = await useFetch<UserData>('/api/extended/current-user', {
        method: HttpMethods.GET,
        headers: {
          'Accept': 'application/json',
        },
      })
      if (error.value) {
        this.clearUser()
      }
      if (data.value) {
        this.setUser(data.value)
      } else {
        this.clearUser()
      }
    },
    async fetchSupervisorProfile(userId: string) {
      try {
        this.supervisorProfile = await $fetch<SupervisorData>(`/api/supervisors/${userId}`, {
          method: HttpMethods.GET,
          headers: {
            'Accept': 'application/json',
          },
        })
        console.log("FETCHED SUPERVISOR PROFILE: ", this.supervisorProfile)
      } catch (error) {
        console.error(error)
      }
    }
  },
})
