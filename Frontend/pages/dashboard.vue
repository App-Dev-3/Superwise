<template>
    <div class="min-h-screen flex flex-col max-w-7xl w-full mx-auto">
        <AdminHeader variant="default" header-text="ligma"/>
        <AdminHeader variant="download" header-text="balls"/>
        <AdminHeader variant="upload"/>
        <AdminHeader variant="delete"/>

        <StatusBar :step=1 class="mt-4"/>
        <div class="my-auto mx-auto max-w-7xl w-full p-12">
            <ActionCard
                button-text="Start Matching!"
                card-type="primary"
            >
                <div class="flex flex-col w-full items-center  p-3"/>
            </ActionCard>
        </div>
        <div class="max-w-7xl w-full">
            <BottomNav
                :active-route="dummyRoute"
                :always-show-labels="false"
                @navigate="navigate"
            />
        </div>
    </div>

</template>

<script setup>

import {ref} from 'vue';
import BottomNav from "../components/BottomNav/BottomNav.vue";
import StatusBar from "../components/StatusBar/StatusBar.vue";
import ActionCard from "../components/ActionCard/ActionCard.vue";
import AdminHeader from "~/components/AdminHeader/AdminHeader.vue";

function navigate(route) {
    dummyRoute.value = route;
    console.log('Navigating to:', route);
}
const dummyRoute = ref('/');
</script>