<script setup>
// Mock version of SideDrawer without i18n dependencies for testing
import {useColorMode} from "#imports";

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

const _colorMode = useColorMode();
const colorMode = _colorMode || {value: 'light'};
</script>

<template>
  <div class="side-drawer">
    <div class="profile-section">
      <div class="avatar">
        <img :src="props.image || getPlaceholderImage(props.firstName, props.lastName)" alt="Avatar">
      </div>
      <div class="user-info">
        <h3>{{ props.firstName }} {{ props.lastName }}</h3>
      </div>
    </div>

    <div class="logo-section">
      <img
          :src="(colorMode?.value === 'dark') ? '/images/appHeader_logo_dark.svg' : '/images/appHeader_logo_light.svg'"
          alt="Logo"
      >
    </div>

    <div class="menu-section">
      <slot name="menu-items"/>
    </div>
  </div>
</template>
