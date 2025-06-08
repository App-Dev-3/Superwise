<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { UserRoles } from '#shared/enums/enums';

const route = useRoute();
const { t } = useI18n();

const bottomNavButtons = [
  {
    label: t('nav.dashboard'),
    icon: 'dashboard',
    route: '/student/dashboard',
  },
  {
    label: t('nav.matching'),
    icon: 'user-group',
    route: '/student/matching',
  },
  {
    label: t('generic.requests'),
    icon: 'message',
    route: '/student/requests',
  },
];

function navigate(route: string) {
  navigateTo(route);
}

const userStore = useUserStore();

// Use useAsyncData to ensure consistent server/client rendering
const { data: currentUser } = await useAsyncData(
    'currentUser',
    async () => {
      if (!userStore.user) {
        await userStore.refetchCurrentUser();
      }
      return userStore.user;
    },
    {
      server: true,
      lazy: false,
      immediate: true,
      default: () => null,
    },
);

const headerText = computed(() => {
  const currentPage: string = route.path.split('/').pop() || '';
  return (
      {
        dashboard: t('nav.dashboard'),
        matching: t('nav.matching'),
        requests: t('generic.requests'),
      }[currentPage] || t('nav.defaultHeader')
  );
});
</script>

<template>
  <div class="w-full h-screen flex max-w-xl m-auto flex-col">
    <AppHeader
        v-if="route.path?.endsWith('dashboard')"
        :first-name="currentUser?.first_name || ''"
        :image="currentUser?.profile_image || getPlaceholderImage(currentUser?.first_name || '', currentUser?.last_name || '')"
        :last-name="currentUser?.last_name || ''"
        :role="UserRoles.STUDENT"
    />
    <AdminHeader
        v-else
        :header-text="headerText"
        variant="text"
    />

    <div class="size-full overflow-y-auto flex flex-col">
      <slot/>
    </div>
    <BottomNav
        :bottom-nav-buttons="bottomNavButtons"
        @navigate="navigate"
    />
  </div>
</template>
