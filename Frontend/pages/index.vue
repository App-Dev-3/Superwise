<template>
  <div>
    <p>Please accept our terms and conditions</p>

    <NuxtLink to="/dashboard">Dashboard</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { NuxtLink } from "#components";

definePageMeta({
  layout: "default",
});
</script>
