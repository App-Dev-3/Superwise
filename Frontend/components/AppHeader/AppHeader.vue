<script setup>
import {useRouter} from 'vue-router';
import {useColorMode} from '#imports';
import {useI18n} from 'vue-i18n';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

const {t} = useI18n();
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
    default: '',
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
          <FontAwesomeIcon
              class="text-xl"
              icon="arrow-left"
          />
          <span
              class="text-sm font-medium opacity-50"
          >{{
              t('appHeader.back')
            }}</span
          >
        </button>

        <div v-if="props.showUser">
          <SideDrawer
              :first-name="props.firstName"
              :image="props.image"
              :last-name="props.lastName"
          />
        </div>

        <AppThemeToggle class="ml-5"/>
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
        <SearchBar
          v-if="props.showSearch"
          right-icon="xmark"
          placeholder="Search..."
          :model-value="props.modelValue"
          search-for="supervisors"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
