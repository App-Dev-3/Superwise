<script setup>
import { useColorMode } from "#imports";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const colorMode = useColorMode();

const { t } = useI18n();

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
});
</script>

<template>
  <div class="drawer">
    <input id="my-drawer" type="checkbox" class="drawer-toggle" >
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
        <img
          :alt="t('generic.logoAlt')"
          :src="
            colorMode?.value === 'dark'
              ? '../images/appHeader_logo_dark.svg'
              : '../images/appHeader_logo_light.svg'
          "
          class="h-6 mb-8"
        >

        <ul class="space-y-3 flex-grow">
          <li>
            <NuxtLink to="/profile">
              <FontAwesomeIcon class="text-xl mr-3" icon="user" />
              {{ t("nav.profile") }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/student/settings">
              <FontAwesomeIcon icon="gear" class="text-xl mr-3" />
              {{ t("nav.settings") }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/tour">
              <FontAwesomeIcon class="text-xl mr-3" icon="map" />
              {{ t("nav.appTour") }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/data-protection">
              <FontAwesomeIcon class="text-xl mr-3" icon="user-shield" />
              {{ t("nav.dataProtection") }}
            </NuxtLink>
          </li>
        </ul>

        <li>
          <SignOutButton>
            <a href="/">
              <span>
                <FontAwesomeIcon class="text-xl" icon="fa-right-from-bracket" />
                {{ t("nav.logout") }}
              </span>
            </a>
          </SignOutButton>
        </li>
      </div>
    </div>
  </div>
</template>
