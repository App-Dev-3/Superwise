<script lang="ts" setup>
import { useRouter } from "vue-router";
import { useColorMode } from "#imports";

const router = useRouter();
const colorMode = useColorMode();

interface AppHeaderProps {
  showBack?: boolean;
  showUser?: boolean;
  showSearch?: boolean;
  modelValue?: string;
  image: string;
  firstName: string;
  lastName: string;
  role: string;
}

const props = withDefaults(defineProps<AppHeaderProps>(), {
  showBack: false,
  showUser: false,
  showSearch: false,
  modelValue: "",
});

const { t } = useI18n();

const goBack = () => {
  router.back();
};

</script>

<template>
  <div class="flex w-full h-fit py-3 px-8 justify-between items-center border-b border-b-base-300">
    <!-- THIS IS UNUSED -->
    <CustomButton
        v-if="props.showBack"
        class="btn btn-ghost btn-circle"
        data-test="back-button"
        icon="arrow-left"
        @click="goBack"
    />

    <SideDrawer
        v-if="props.showUser"
        :first-name="props.firstName"
        :image="props.image"
        :last-name="props.lastName"
        :role="props.role"
        class="w-fit"
    />


    <ClientOnly v-if="!props.modelValue">
      <img
          :src="
              colorMode.value === 'dark'
                ? '../images/appHeader_logo_dark.svg'
                : '../images/appHeader_logo_light.svg'
            "
          alt="Logo image"
          aria-hidden="true"
          class="h-6"
      >
    </ClientOnly>

    <div
        v-else
        class="w-full flex justify-start items-center"
    >
      <h1 class="text-header">
        {{ props.modelValue }}
      </h1>
    </div>

    <CustomButton
        v-if="props.showSearch"
        :aria-label="t('appHeader.search')"
        class="w-10"
        color="default"
        right-icon="fa-magnifying-glass"
        text=""
        variant="ghost"
        @click="router.push(`/${props.role.toLowerCase()}/search`)"
    />
  </div>
</template>

<style scoped></style>
