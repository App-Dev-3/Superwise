import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowLeft, faUser, faSearch, faEnvelope, faXmark } from '@fortawesome/free-solid-svg-icons'

library.add(faArrowLeft, faUser, faSearch, faEnvelope, faXmark)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon)
})
