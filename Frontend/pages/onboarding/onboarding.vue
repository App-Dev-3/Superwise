<script lang="ts" setup>
import { until } from "@vueuse/core";
import { onMounted } from "vue";


const { isLoaded, user } = useUser();
const registrationStore = useRegistrationStore();

onMounted(async () => {

  await until(isLoaded).toBe(true);

  const userEmail = user.value?.primaryEmailAddress?.emailAddress;
  let role = "student"; // default to student
  if (!userEmail) return;
  try {
    await registrationStore.fetchRegistrationStatus(userEmail)
    if (registrationStore.status?.exists) {
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
</script>

<template>
  <div class="flex justify-center items-center min-h-screen">
    <p>Loading onboarding info...</p>
  </div>
</template>