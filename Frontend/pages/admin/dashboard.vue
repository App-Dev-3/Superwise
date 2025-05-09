<template>
    <div class="w-full h-full box-border">
        <AppHeader
            show-search
            show-user
        />

        <div class="w-full h-full overflow-y-auto flex flex-col px-6 py-8 gap-4">

            <div class="rounded-3xl bg-base-100 shadow-lg flex flex-col  border border-base-300 ">
                <div class="p-8 gap-4 admin-overview-grid">
                    <FontAwesomeIcon
                        class="opacity-75"
                        icon="user"
                    />
                    <span class="text-body text-primary">67/134</span>
                    <span class="text-x-small opacity-50">supervisors are using the app</span>

                    <FontAwesomeIcon
                        class="opacity-75"
                        icon="user-group"
                    />
                    <span class="text-body text-primary">159/213</span>
                    <span class="text-x-small opacity-50">available slots</span>
                </div>


                <hr class="border-base-300">
                <div class="p-8 gap-4 admin-overview-grid">
                    <FontAwesomeIcon
                        class="opacity-75"
                        icon="user-group"
                    />
                    <span class="text-body text-primary">54/120</span>
                    <span class="text-x-small opacity-50">students have a supervisor</span>

                    <FontAwesomeIcon
                        class="opacity-75"
                        icon="user-group"
                    />
                    <span class="text-body text-primary">12/120</span>
                    <span class="text-x-small opacity-50">are currently waiting for supervision approval</span>
                </div>
            </div>

            <CustomButton
                color="info"
                left-icon="cloud-upload-alt"
                text="Import"
                wide
            />

            <CustomButton
                color="success"
                left-icon="file-download"
                text="Export"
                wide
            />

            <CustomButton
                color="error"
                left-icon="trash-can"
                text="Delete"
                wide
            />
        </div>
    </div>
</template>

<script lang="ts" setup>

import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

definePageMeta({
    layout: "default",
});
</script>

<style scoped>
.admin-overview-grid {
    display: grid;
    grid-template-columns: auto auto 1fr;
    grid-template-rows: repeat(2, 1fr);
    align-items: baseline;
}

.admin-overview-grid > :nth-child(3n-1) {
    text-align: right;
}

</style>