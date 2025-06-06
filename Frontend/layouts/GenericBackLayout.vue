<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const route = useRoute();
const { t } = useI18n();

const headerText = computed(() => {
  const breadCrumbs: string[] = route.path.substring(1).split('/');
  console.log('breadCrumbs', breadCrumbs);
  if (breadCrumbs[0].includes('profiles')) {
    return t("nav.profile");
  }

  const currentPage: string = breadCrumbs.pop() || '';
  return {
    'data-protection': t('nav.dataProtection'),
    settings: t('nav.settings'),
    profile: t('profile.pageHeader'),
  }[currentPage] || t("nav.defaultHeader");
})
</script>

<template>

  <div class="w-full h-screen flex max-w-xl m-auto flex-col">
    <AdminHeader :header-text="headerText"/>
    <div class="size-full overflow-y-auto flex flex-col">
      <slot/>
    </div>
  </div>
</template>