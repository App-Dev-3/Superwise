<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const route = useRoute();
const { t } = useI18n();

const headerText = computed(() => {
  const breadCrumbs: string[] = route.path.substring(1).split("/");
  console.log("breadCrumbs", breadCrumbs);
  if (breadCrumbs[0].includes("profiles")) {
    return t("nav.profile");
  }

  const currentPage: string = breadCrumbs.pop() || "";
  return (
      {
        "data-protection": t("nav.dataProtection"),
        settings: t("nav.settings"),
        profile: t("profile.pageHeader"),
        "currently-supervising": t("nav.currentlySupervising"),
        download: t("appHeader.admin.downloadData"),
        upload: t("appHeader.admin.uploadData"),
        delete: t("appHeader.admin.deleteData"),
        "new-cycle": t("appHeader.admin.newCycle"),
        "add-admin": t("appHeader.addAdmin"),
      }[currentPage] || t("nav.defaultHeader")
  );
});

const getVariant = computed(
  (): "default" | "upload" | "download" | "delete" | "warning" |"text" | undefined => {
    const breadCrumbs: string[] = route.path.substring(1).split("/");
    const currentPage = breadCrumbs.pop() || "";
    if (breadCrumbs[0].includes("admin")) {
      const variant = {
        download: "download",
        upload: "upload",
        delete: "delete",
        "new-cycle": "delete",
        "add-admin": "warning",
      }[currentPage] as "download" | "upload" | "delete" | "warning" | undefined;

        return variant || "default";
      }
      return "default";
    }
);
</script>

<template>
  <div class="w-full h-screen flex max-w-xl m-auto flex-col">
    <AdminHeader :header-text="headerText" :variant="getVariant"/>
    <div class="size-full overflow-y-auto flex flex-col">
      <slot/>
    </div>
  </div>
</template>
