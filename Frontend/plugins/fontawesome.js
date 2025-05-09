import {library} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {
  faArrowLeft,
  faArrowRight,
  faArrowRightToBracket,
  faCheck,
  faCloudArrowUp,
  faEnvelope,
  faHandshakeSimple,
  faHourglass,
  faHouse,
  faMessage,
  faMoon,
  faSearch,
  faSun,
  faTriangleExclamation,
  faUser,
  faUserGroup,
  faXmark
} from '@fortawesome/free-solid-svg-icons'
import {defineNuxtPlugin} from "nuxt/app";

library.add(
    faArrowLeft,
    faArrowRight,
    faUser,
    faSearch,
    faEnvelope,
    faXmark,
    faHourglass,
    faUserGroup,
    faArrowRightToBracket,
    faMessage,
    faHandshakeSimple,
    faCheck,
    faMoon,
    faSun,
    faHouse,
    faTriangleExclamation,
    faCloudArrowUp,
    faArrowRight
)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon)
})