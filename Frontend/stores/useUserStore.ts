import { defineStore } from 'pinia'
import type { UserData } from '~/shared/types/userInterfaces'
import { HttpMethods } from "#shared/enums/enums";

const STORAGE_KEY = 'app_user'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as UserData | null,
  }),
  actions: {
    setUser(userData: UserData) {
      this.user = userData
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    },
    clearUser() {
      this.user = null
      localStorage.removeItem(STORAGE_KEY)
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
    }
  },
})
