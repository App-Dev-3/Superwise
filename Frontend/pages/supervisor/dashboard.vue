<template>
    <!-- TODO: Add the content of the page -->
    <div>
        TODO
        <BottomNav
            :bottom-nav-buttons="bottomNavButtons"
            :active-route="dummyRoute"
            :always-show-labels="false"
            @navigate="navigate"
        />
    </div>

</template>

<script setup lang="ts">



const bottomNavButtons = [
    { label: 'Dashboard', icon: 'house', route: '/supervisor/dashboard' },
    { label: 'Matching', icon: 'user-group', route: '/supervisor/matching' },
    { label: 'Chat', icon: 'message', route: '/supervisor/chat' }
]



function navigate(route: string) {
    dummyRoute.value = route;
    navigateTo(route);
}

const dummyRoute = ref("/");

</script>

<style scoped>

</style>