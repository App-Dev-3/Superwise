<script setup>
import { useColorMode } from "#imports";

const colorMode = useColorMode();

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
      <label for="my-drawer" class="drawer-button">
        <div class="avatar">
          <div class="mask mask-squircle w-8 rounded-full">
            <img
              :src="
                props.image ||
                getPlaceholderImage(props.firstName, props.lastName)
              "
              alt="Profile Picture of {{ props.firstName }} {{ props.lastName }}"
            >
          </div>
        </div>
      </label>
    </div>

    <div class="drawer-side z-40">
      <label
        for="my-drawer"
        aria-label="close sidebar"
        class="drawer-overlay"
      />
      <div
        class="menu py-16 px-8 bg-base-200 text-base-content min-h-full w-80 flex flex-col"
      >
        <img
          :src="
            colorMode?.value === 'dark'
              ? '../images/appHeader_logo_dark.svg'
              : '../images/appHeader_logo_light.svg'
          "
          alt="Logo"
          class="h-6 mb-8"
        >

        <ul class="space-y-3 flex-grow">
          <li>
            <NuxtLink to="/profile">
              <FontAwesomeIcon icon="user" class="text-xl mr-3" />
              Profile
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/settings">
              <FontAwesomeIcon icon="gear" class="text-xl mr-3" />
              Settings
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/tour">
              <FontAwesomeIcon icon="map" class="text-xl mr-3" />
              App Tour
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/data-protection">
              <FontAwesomeIcon icon="user-shield" class="text-xl mr-3" />
              Data Protection
            </NuxtLink>
          </li>
        </ul>

        <li>
          <SignOutButton redirect-url="/">
            <span>
              <FontAwesomeIcon icon="fa-right-from-bracket" class="text-xl" />
              <span>Logout</span>
            </span>
          </SignOutButton>
        </li>
      </div>
    </div>
  </div>
</template>
