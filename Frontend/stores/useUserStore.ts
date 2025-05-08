import type { get } from 'http'
import { defineStore } from 'pinia'
import type { UserData } from '~/shared/types/userInterfaces'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as UserData | null,
  }),
  actions: {
    setUser(userData: UserData) {
      console.log('setUser', userData)
      this.user = userData
    },
    clearUser() {
      this.user = null
    },
  },
})
