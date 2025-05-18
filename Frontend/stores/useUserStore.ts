import { defineStore } from 'pinia'
import type { UserData } from '~/shared/types/userInterfaces'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as UserData | null,
  }),
  actions: {
    setUser(userData: UserData) {
      this.user = userData
    },
    clearUser() {
      this.user = null
    },
  },
})