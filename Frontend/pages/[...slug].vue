<template>
    <div class="m-auto">
        <FontAwesomeIcon
            class="text-base-content/60 text-6xl"
            icon="link-slash"
        />
        <h1 class="text-base-content/60 text-2xl">
            {{ t('generic.404-not-found') }}
        </h1>
    <CustomButton text="Go Home" variant="outline" color="accent" @click="$router.push('/')" />
    </div>
</template>
<script setup lang="ts">
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
const { t } = useI18n();
</script>