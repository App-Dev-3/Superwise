<template>

  <div class="w-full h-screen flex flex-col justify-center items-center">
    <div class="w-full h-full flex flex-col p-8 gap-4">
      <div class="flex justify-center w-full p-y">
        <ClientOnly>
          <img
              :src="colorMode.value === 'dark' ? 'images/appLanding_logo_dark.svg' : 'images/appLanding_logo_light.svg'"
              alt="Logo image"
              class="w-full max-w-96">
        </ClientOnly>
      </div>
      <div class="py-16 flex flex-col gap-2">
        <div class="text-x-small">
          In order to find the perfect supervisor for you, we have to collect and process some data.
        </div>
        <div class="text-x-small">
          <!-- TODO: make a link to actual terms and condition -->
          Find out <a class="text-xs-link" href="https://youtu.be/dQw4w9WgXcQ?feature=shared">here</a> what we do with
          it!
        </div>
      </div>
    </div>

    <div class="w-full p-4 justify-center">
      <CustomButton
          block
          color="primary"
          right-icon="arrow-right"
          text="Continue"
      />
    </div>
  </div>
</template>

<script setup>
import {useColorMode} from "#imports";

const colorMode = useColorMode();
</script>