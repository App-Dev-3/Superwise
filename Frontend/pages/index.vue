<template>
    <div class="w-full h-screen flex flex-col justify-center items-center p-8 gap-4">
        <ClientOnly>
            <img
                :src="colorMode.value === 'dark' ? 'images/appLanding_logo_dark.svg' : 'images/appLanding_logo_light.svg'"
                alt="Logo image"
                class="w-full max-w-96">
        </ClientOnly>

        <div class="pt-16 flex flex-col gap-4 justify-between h-full">
            <div>
                <div class="text-x-small">
                    In order to find the perfect supervisor for you, we have to collect and process some data.
                </div>
                <div class="text-x-small">
                    <!-- TODO: make a link to actual terms and condition -->
                    Find out <a class="text-xs-link" href="https://youtu.be/dQw4w9WgXcQ?feature=shared">here</a> what we do with
                    it!
                </div>
            </div>
            <SignInButton>
                <CustomButton
                    block
                    color="primary"
                    right-icon="arrow-right"
                    text="Continue"
                />
            </SignInButton>


        </div>


    </div>
</template>

<script setup>
import {useColorMode} from "#imports";
import {useRouter} from 'vue-router';

const colorMode = useColorMode();
const router = useRouter();

const navigateToNext = () => {
    router.push('/onboarding');
};

definePageMeta({
    layout: "default",
});
</script>
