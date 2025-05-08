<script lang="ts" setup>
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
</script>

<template>
  <div
      v-if="show"
      class="fixed bottom-18 left-0 right-0 flex justify-center z-50 px-12"
  >
    <div class="alert alert-success w-full shadow-lg" role="alert">
      <FontAwesomeIcon class="text-xl" icon="check"/>
      <span>Your purchase has been confirmed!</span>
      <CustomButton
          color="default"
          text="close"
      />
    </div>
  </div>
</template>

<style scoped>

</style>