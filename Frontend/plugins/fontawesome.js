import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faArrowRightToBracket,
  faBan,
  faCheck,
  faCloudArrowUp,
  faEnvelope,
  faEye,
  faEyeSlash,
  faFileDownload,
  faHandshakeSimple,
  faHourglass,
  faHouse,
  faMessage,
  faMoon,
  faSearch,
  faSun,
  faTrashCan,
  faTriangleExclamation,
  faUser,
  faUserGroup,
  faXmark,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { defineNuxtPlugin } from "nuxt/app";

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
  faEye,
  faEyeSlash,
  faMagnifyingGlass
);

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("FontAwesomeIcon", FontAwesomeIcon);
});
