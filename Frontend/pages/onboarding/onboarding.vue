<script setup lang="ts">
import { until } from "@vueuse/core";
import { onMounted } from "vue";
import type { UserData } from "~/shared/types/userInterfaces";

const { getUserByEmail, getMatches} = useUserApi();


onMounted(async() => {
  const { isLoaded, isSignedIn, user } = useUser();
  
  await until(isLoaded).toBe(true);
  const onboardingComplete = user.value?.unsafeMetadata.onboardingCompleted;

  try {
    const userEmail = user.value?.primaryEmailAddress?.emailAddress;
    let role = "student"; // default to student
    console.log("issue occuring form here" );
    if (!userEmail) return; 
    const res = await getUserByEmail( userEmail ) as UserData;
    role = res.role;
    console.log("redirecting to onboarding page");
    navigateTo(`/onboarding/${res.role}`);
    
  } catch (error) {
    console.error("Error getting user role:", error);
  }
});

</script>

<template>
  <div class="flex justify-center items-center min-h-screen">
    <p>Loading onboarding info...</p>
  </div>
</template>