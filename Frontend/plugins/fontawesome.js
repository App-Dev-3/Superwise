import {library} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {
  faArrowLeft,
  faArrowRightToBracket,
  faCheck,
  faEnvelope,
  faHandshakeSimple,
  faHourglass,
  faHouse,
  faMessage,
  faMoon,
  faSearch,
  faSun,
  faHandshakeSimple,
  faMessage,
  faArrowRightToBracket,
  faCheck, faHouse, faCloudArrowUp
} from '@fortawesome/free-solid-svg-icons'
import {defineNuxtPlugin} from "nuxt/app";

library.add(
    faArrowLeft,
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
    faHouse
)

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon)
})
