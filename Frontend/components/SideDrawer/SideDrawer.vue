<script setup>
import {useRouter} from "vue-router";
import {useColorMode} from "#imports";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

const colorMode = useColorMode();
const router = useRouter();

const {t} = useI18n();

// Add ref to track client-side rendering
const isClient = ref(false);

onMounted(() => {
  isClient.value = true;
});

const props = defineProps({
  image: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "student",
  },
});

// Computed property to get the logo path
const logoPath = computed(() => {
  return colorMode?.value === 'dark'
      ? '../images/appHeader_logo_dark.svg'
      : '../images/appHeader_logo_light.svg';
});
</script>

<template>
  <div class="drawer">
    <input id="my-drawer" class="drawer-toggle" type="checkbox">
    <div class="drawer-content">
      <label class="drawer-button" for="my-drawer">
        <div class="avatar">
          <div class="mask mask-squircle w-8 rounded-full">
            <img
                :alt="
                t('generic.profilePictureAlt', {
                  firstName: props.firstName,
                  lastName: props.lastName,
                })
              "
                :src="
                props.image ||
                getPlaceholderImage(props.firstName, props.lastName)
              "
            >
          </div>
        </div>
      </label>
    </div>

    <div class="drawer-side z-40">
      <label
          aria-label="close sidebar"
          class="drawer-overlay"
          for="my-drawer"
      />
      <div
          class="menu py-16 px-8 bg-base-200 text-base-content min-h-full w-80 flex flex-col"
      >
        <!-- Use client-only component for logo to prevent hydration mismatch -->
        <ClientOnly>
          <img
              :alt="t('generic.logoAlt')"
              :src="logoPath"
              class="h-6 mb-8 cursor-pointer"
              @click="router.push('/')"
          >
          <template #fallback>
            <!-- Fallback with a placeholder during SSR -->
            <div class="h-6 mb-8 w-32 bg-base-300 animate-pulse"/>
          </template>
        </ClientOnly>

        <ul class="space-y-3 flex-grow">
          <li>
            <NuxtLink
                :to="props.role ? `/${props.role.toLowerCase()}/profile` : `/`"
            >
              <FontAwesomeIcon class="text-xl mr-3" icon="user"/>
              {{ t("nav.profile") }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
                :to="props.role ? `/${props.role.toLowerCase()}/settings` : `/`"
            >
              <FontAwesomeIcon class="text-xl mr-3" icon="gear"/>
              {{ t("nav.settings") }}
            </NuxtLink>
          </li>
          <!--          <li>-->
          <!--            <NuxtLink to="/tour">-->
          <!--              <FontAwesomeIcon class="text-xl mr-3" icon="map" />-->
          <!--              {{ t("nav.appTour") }}-->
          <!--            </NuxtLink>-->
          <!--          </li>-->
          <li>
            <NuxtLink
                :to="
                props.role
                  ? `/${props.role.toLowerCase()}/data-protection`
                  : `/`
              "
            >
              <FontAwesomeIcon class="text-xl mr-3" icon="user-shield"/>
              {{ t("nav.dataProtection") }}
            </NuxtLink>
          </li>
        </ul>

        <li>
          <SignOutButton>
            <a href="/">
              <span>
                <FontAwesomeIcon class="text-xl" icon="fa-right-from-bracket"/>
                {{ t("nav.logout") }}
              </span>
            </a>
          </SignOutButton>
        </li>
      </div>
    </div>
  </div>
</template>
