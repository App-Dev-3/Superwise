<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";
import { useColorMode } from "#imports";

const router = useRouter();
const colorMode = useColorMode();

const props = defineProps({
  showBack: {
    type: Boolean,
    default: false,
  },
  showUser: {
    type: Boolean,
    default: false,
  },
  showSearch: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: String,
    default: "",
  },
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

const isSearching = ref(false);

const emit = defineEmits(["update:modelValue"]);

function handleInput(value) {
  emit("update:modelValue", value);
}

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="w-full">
    <div class="navbar bg-base-100 shadow z-10">
      <div class="navbar-start ps-3">
        <button
          v-if="props.showBack"
          class="btn btn-ghost btn-circle"
          data-test="back-button"
          @click="goBack"
        >
          <FontAwesomeIcon icon="arrow-left" class="text-xl" />
          <span class="text-sm font-medium opacity-50">Back</span>
        </button>

        <div v-if="props.showUser">
          <div class="drawer">
            <input id="my-drawer" type="checkbox" class="drawer-toggle" >
            <div class="drawer-content">
              <!-- Page content here -->
              <label for="my-drawer" class="drawer-button"
                ><div class="avatar">
                  <div class="mask mask-squircle w-8 rounded-full">
                    <img
                      :src="
                        props.image ||
                        getPlaceholderImage(props.firstName, props.lastName)
                      "
                      alt="Profile Picture of {{ props.firstName }} {{ props.lastName }}"
                    >
                  </div></div
              ></label>
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
                <!-- logo -->
                <img
                  :src="
                    colorMode.value === 'dark'
                      ? '../images/appHeader_logo_dark.svg'
                      : '../images/appHeader_logo_light.svg'
                  "
                  alt="Logo"
                  class="h-6 mb-8"
                >

                <!-- menu items -->
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
                      <FontAwesomeIcon
                        icon="user-shield"
                        class="text-xl mr-3"
                      />
                      Data Protection
                    </NuxtLink>
                  </li>
                </ul>
                <!-- logout at bottom -->
                <li>
                  <NuxtLink to="/logout">
                    <FontAwesomeIcon icon="fa-right-from-bracket" class="" />
                    Logout
                  </NuxtLink>
                </li>
              </div>
            </div>
          </div>
        </div>

        <AppThemeToggle class="ml-5" />
      </div>

      <ClientOnly>
        <div class="navbar-center">
          <img
            :src="
              colorMode.value === 'dark'
                ? '../images/appHeader_logo_dark.svg'
                : '../images/appHeader_logo_light.svg'
            "
            alt="Logo image"
            class="h-6"
          >
        </div>
      </ClientOnly>

      <div class="navbar-end">
        <button
          v-if="props.showSearch"
          class="btn btn-ghost btn-circle"
          data-test="search-button"
          @click="isSearching = !isSearching"
        >
          <FontAwesomeIcon icon="search" class="text-xl" />
        </button>
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="isSearching"
        class="bg-base-100 px-4 pt-3 pb-4 border-t border-base-300"
      >
        <InputField
          :auto-focus="isSearching"
          :model-value="props.modelValue"
          placeholder="Search..."
          label="Search Field"
          note=""
          right-icon="xmark"
          @update:model-value="handleInput"
        />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
