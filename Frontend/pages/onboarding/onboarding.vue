<script setup lang="ts">
import { until } from "@vueuse/core";
import { onMounted } from "vue";

const authStore = useAuthStore()
await authStore.initialize()
const { user, isLoaded } = storeToRefs(authStore)
const registrationStore = useRegistrationStore();

onMounted(async () => {

  await until(isLoaded).toBe(true);

  const userEmail = user.value?.primaryEmailAddress?.emailAddress;
  let role = "student"; // default to student
  if (!userEmail) return;
  try {
      if (!registrationStore.status || !registrationStore.status.exists || registrationStore.status.is_registered) {
          await registrationStore.fetchRegistrationStatus(userEmail)
      }
    if (registrationStore.status?.exists){
      role = determineRole(registrationStore.status?.exists)
    }
  } catch (error) {
    console.error("Error getting user role:", error);
  }
  navigateTo(`/onboarding/${ role }`);
});


function determineRole(exists: boolean) {
  /**Rule for app -> if user exists but isnt registered
   then its a supervisor provided by admin**/
  if (exists) {
    return 'supervisor';
  } else {
    return 'student';
  }
}

definePageMeta({
  layout: "onboarding-layout",
});
</script>

<template>
  <div class="flex justify-center items-center min-h-screen">
    <p>Loading onboarding info...</p>
  </div>
</template>