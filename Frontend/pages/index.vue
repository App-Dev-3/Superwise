<template>
  <div>
    <!-- Here goes the first page of the app. It should lead to clerk sign up then redirected to the dashboard
    The dashboard is covered by an authentication layout which would redirect to onboarding
    if user hasnt onboarded yet -->


    <!-- This nuxt link should be removed once there is a page that the user can use to move on -->
    <NuxtLink to="/dashboard">Dashboard</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { NuxtLink } from "#components";

definePageMeta({
  layout: "default",
});
</script>
