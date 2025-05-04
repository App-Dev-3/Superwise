import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faArrowLeft,
  faUser,
  faSearch,
  faEnvelope,
  faXmark,
  faHourglass,
  faUserGroup,
  faMoon,
  faSun,
} from '@fortawesome/free-solid-svg-icons'
import {defineNuxtPlugin} from "nuxt/app";

library.add(faArrowLeft, faUser, faSearch, faEnvelope, faXmark, faHourglass, faUserGroup, faMoon, faSun)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon)
})
