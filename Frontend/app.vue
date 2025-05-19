<template>
  <div>
    <!-- TODO:This should be checked out. Throttle should not be 0, but otherWise it wont show-->
    <NuxtLoadingIndicator
      throttle="0"
    />
    <VitePwaManifest/>
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
    <!-- <NuxtRouteAnnouncer />
    <NuxtWelcome /> -->
  </div>
</template>
