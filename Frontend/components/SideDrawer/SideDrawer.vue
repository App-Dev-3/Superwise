<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { useColorMode } from '#imports';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { DrawerLinkListInterface } from "~/shared/types/userInterfaces";

const colorMode = useColorMode();
const router = useRouter();

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
  role: {
    type: String,
    default: 'student',
  },
});

const drawerLinks: DrawerLinkListInterface = {
  student: [
    { key: 'profile', url: '/student/profile', text: t('nav.profile'), icon: 'user' },
    { key: 'settings', url: '/student/settings', text: t('nav.settings'), icon: 'gear' },
    { key: 'app-tour', url: '/student/app-tour', text: t('nav.appTour'), icon: 'map' },
    { key: 'data-protection', url: '/student/data-protection', text: t('nav.dataProtection'), icon: 'user-shield' },
  ],
  supervisor: [
    { key: 'profile', url: '/supervisor/profile', text: t('nav.profile'), icon: 'user' },
    { key: 'settings', url: '/supervisor/settings', text: t('nav.settings'), icon: 'gear' },
    { key: 'app-tour', url: '/supervisor/app-tour', text: t('nav.appTour'), icon: 'map' },
    { key: 'data-protection', url: '/supervisor/data-protection', text: t('nav.dataProtection'), icon: 'user-shield' },
  ],
  admin: [
    { key: 'profile', url: '/admin/profile', text: t('nav.profile'), icon: 'user' },
    { key: 'settings', url: '/admin/settings', text: t('nav.settings'), icon: 'gear' },
    { key: 'app-tour', url: '/admin/app-tour', text: t('nav.appTour'), icon: 'map' },
    { key: 'data-protection', url: '/admin/data-protection', text: t('nav.dataProtection'), icon: 'user-shield' },
    { key: 'new-cycle', url: '/admin/new-cycle', text: t('nav.newCycle'), icon: 'arrows-spin' },
  ],
};
</script>

<template>
  <div class="drawer">
    <input id="my-drawer" class="drawer-toggle" type="checkbox">
    <div class="drawer-content">
      <label class="drawer-button" for="my-drawer">
        <Avatar
            :alt="
						t('generic.profilePictureAlt', {
							firstName: props.firstName,
							lastName: props.lastName,
						})
					"
            :first-name="props.firstName"
            :last-name="props.lastName"
            :src="props.image"
            shape="circle"
            size="xs"
        />
      </label>
    </div>

    <div class="drawer-side z-40">
      <label
          aria-label="close sidebar"
          class="drawer-overlay"
          for="my-drawer"
      />
      <div
          class="menu bg-base-100 min-h-full w-fit flex flex-col p-0 gap-2 h-full"
      >
        <div class="flex w-full h-fit py-4 px-8 border-b border-b-base-300">

          <img
              :alt="t('generic.logoAlt')"
              :src="
						colorMode?.value === 'dark'
							? '../images/appHeader_logo_dark.svg'
							: '../images/appHeader_logo_light.svg'
					"
              class="cursor-pointer h-8"
              @click="router.push('/')"
          >
        </div>

        <div class="flex flex-col flex-grow h-0">
          <ul class="space-y-3 flex flex-col w-fit h-full">
            <li
                v-for="link in drawerLinks[props.role.toLowerCase() as 'student' | 'supervisor' | 'admin' || 'student']"
                :key="link.key"
                class="w-contain px-2"
            >
              <NuxtLink
                  :to="link.url"
                  class="px-6 py-4 gap-3"
              >
                <FontAwesomeIcon
                    :icon="link.icon"
                    class="text-xl"
                />
                <p class="text-large">
                  {{ link.text }}
                </p>
              </NuxtLink>
            </li>
            <li class="w-contain p-2 border-t border-t-base-300 list-none mt-auto">
              <SignOutButton>
                <NuxtLink
                    class="px-6 py-2"
                    to="/"
                >
                  <FontAwesomeIcon
                      class="text-xl"
                      icon="fa-right-from-bracket"
                  />

                  <p class="text-large">
                    {{ t('nav.logout') }}
                  </p>
                </NuxtLink>
              </SignOutButton>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
