<template>
  <div>
    <header>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div v-if="!isLoaded">Loading...</div>

        <div v-else>Hello {{ user?.primaryEmailAddress }}!</div>
      </SignedIn>
    </header>
  </div>
</template>

<script setup>
import { useUser } from "@clerk/vue";

definePageMeta({
  layout: "authenticated",
});

const { user, isLoaded } = useUser();
</script>
