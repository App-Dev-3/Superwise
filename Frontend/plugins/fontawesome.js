import {library} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {
  faArrowLeft,
  faArrowRight,
  faArrowRightToBracket,
  faBan,
  faCheck,
  faCloudArrowUp,
  faEdit,
  faEnvelope,
  faFileDownload,
  faEnvelope, faEye, faEyeSlash, faFileDownload,
  faHandshakeSimple,
  faHourglass,
  faHouse,
  faMessage,
  faMinus,
  faMoon,
  faPlus,
  faSearch,
  faSun,
  faTrashCan,
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
    faArrowRight,
    faFileDownload,
    faTrashCan,
    faBan,
    faEdit,
    faPlus,
    faMinus,
faEye,
    faEyeSlash
)

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon)
})