import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faArrowRightToBracket,
  faBan,
  faArrowRightToBracket,
  faBan,
  faCheck,
  faCloudArrowUp,
  faEnvelope,
  faEye,
  faEyeSlash,
  faFileDownload,
  faGear,
  faEdit,
  faHandshakeSimple,
  faHourglass,
  faHouse,
  faMap,
  faHouse,
  faMap,
  faMessage,
  faMoon,
  faRightFromBracket,
  faSearch,
  faSun,
  faTrashCan,
  faTriangleExclamation,
  faUser,
  faUserGroup,
  faUserShield,
  faXmark,
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
  faEdit,
  faPlus,
  faMinus,
  faEye,
  faEyeSlash,
  faGear,
  faUserShield,
  faMap,
  faRightFromBracket
);

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("FontAwesomeIcon", FontAwesomeIcon);
});
