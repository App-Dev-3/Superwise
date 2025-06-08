<script lang="ts" setup>
import { useRouter } from "vue-router";
import { useColorMode } from "#imports";

const router = useRouter();
const colorMode = useColorMode();

interface AppHeaderProps {
  image: string;
  firstName: string;
  lastName: string;
  role: string;
}

const props = defineProps<AppHeaderProps>();

</script>

<template>
  <div class="flex w-full h-fit py-3 px-8 justify-between items-center border-b border-b-base-300">

    <SideDrawer
        :first-name="props.firstName"
        :image="props.image"
        :last-name="props.lastName"
        :role="props.role"
        class="w-fit"
    />


    <ClientOnly>
      <img
          :src="
              colorMode.value === 'dark'
                ? '../images/appHeader_logo_dark.svg'
                : '../images/appHeader_logo_light.svg'
            "
          alt="Logo image"
          class="h-6"
      >
    </ClientOnly>

    <CustomButton
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
