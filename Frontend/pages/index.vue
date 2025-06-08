<template>
  <div
      class="w-full h-screen flex max-w-xl m-auto flex-col p-6 items-center"
  >
    <ClientOnly>
      <img
          :src="colorMode.value === 'dark'? 'images/appLanding_logo_dark.svg': 'images/appLanding_logo_light.svg'"
          alt="Logo image"
          class="w-full max-w-96 mx-auto"
      >
    </ClientOnly>

    <div
        class="w-full pt-16 flex flex-col gap-4 justify-between h-full"
    >
      <div class="text-body max-w-md self-center">
        <i18n-t
            keypath="landing.dataCollection"
            tag="label"
        >
          <a
              class="text-primary"
              href="https://superwise.at/data-protection"
              target="_blank"
          >
            {{ t('landing.here') }}
          </a>
        </i18n-t>
      </div>
      <SignInButton>
        <CustomButton
            :text="t('generic.continue')"
            block
            color="primary"
            right-icon="arrow-right"
        />
      </SignInButton>
    </div>
  </div>
</template>

<script setup>
import {useColorMode} from '#imports';

const {t} = useI18n();

const colorMode = useColorMode();

</script>
