<script lang="ts" setup>

import { ref } from "vue";
import type { UserData } from "#shared/types/userInterfaces";
import { useRoute } from 'vue-router';

const route = useRoute();
const { t } = useI18n();

const bottomNavButtons = [
  {
    label: t("nav.dashboard"),
    icon: "house",
    route: "/student/dashboard",
  },
  {
    label: t("nav.matching"),
    icon: "user-group",
    route: "/student/matching",
  },
  {
    label: t("generic.requests"),
    icon: "message",
    route: "/student/requests",
  },
];

function navigate(route: string) {
  navigateTo(route);
}

const currentUser = ref<UserData | null>(null);

const headerText = computed(() => {
  const currentPage: string = route.path.split('/').pop() || '';
  return {
    dashboard: t("nav.dashboard"),
    matching: t("nav.matching"),
    requests: t("generic.requests"),
  }[currentPage] || t("nav.defaultHeader");
})

</script>

<template>
  <div class="w-full h-screen flex max-w-xl m-auto flex-col">
    <AppHeader
        v-if="route.path?.endsWith('dashboard')"
        :first-name="currentUser?.first_name"
        :last-name="currentUser?.last_name"
        :role="currentUser?.role"
        show-search
        show-user
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
        :always-show-labels="false"
        :bottom-nav-buttons="bottomNavButtons"
        @navigate="navigate"
    />
  </div>
</template>