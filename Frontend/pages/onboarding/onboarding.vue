<script setup lang="ts">
import { until } from "@vueuse/core";
import { onMounted } from "vue";
import type { UserData } from "~/shared/types/userInterfaces";

const { getUserByEmail, getMatches} = useUserApi();


onMounted(async() => {
  const { isLoaded, isSignedIn, user } = useUser();
  
  await until(isLoaded).toBe(true);

  const userEmail = user.value?.primaryEmailAddress?.emailAddress;
  let role = "student"; // default to student
  console.log("issue occuring form here" );
  if (!userEmail) return; 
  try {
    const res = await getUserByEmail( userEmail ) as UserData;
    role = res.role;
    console.log("redirecting to onboarding page");
    
  } catch (error) {
    console.error("Error getting user role:", error);
  }
  navigateTo(`/onboarding/${role}`);
});

</script>

<template>
  <div class="flex justify-center items-center min-h-screen">
    <p>Loading onboarding info...</p>
  </div>
</template>