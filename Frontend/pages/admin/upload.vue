<script setup lang="ts">
import type {ParsedCsv, TagSimilarityData} from "#shared/types/fileUploadTypes";
import {transformCsvDataToImportFormat} from "~/utils/csvHelpers";
import {HttpMethods} from "#shared/enums/enums";

const handleCsvUpload = (filename: string, content: ParsedCsv) => {
    const transformedData = transformCsvDataToImportFormat(content);

    $fetch("/api/admin/supervisors/bulk-import", {
        method: HttpMethods.POST,
        body: transformedData,
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => {
        feedbackToast.value = {
            visible: true,
            type: "success",
            message: res.message,
        }
        setTimeout(() => {
            feedbackToast.value.visible = false;
        }, 8000);
    }).catch((error) => {
        if (error.status === 400) {
            feedbackToast.value = {
                visible: true,
                type: "error",
                message: "Invalid CSV format. Please check the if all the columns are correct.",
            }
        } else {
            feedbackToast.value = {
                visible: true,
                type: "error",
                message: error.message}
        }
        setTimeout(() => {
            feedbackToast.value.visible = false;
        }, 8000);
    })
};
const handleJsonUpload = (filename: string, content: TagSimilarityData) => {
    $fetch("/api/admin/tags/bulk-import", {
        method: HttpMethods.POST,
        body: content,
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => {
        feedbackToast.value = {
            visible: true,
            type: "success",
            message: res.message,
        }
        setTimeout(() => {
                feedbackToast.value.visible = false;
            }, 8000);
    }).catch((error) => {
        if (error.status === 400) {
            feedbackToast.value = {
                visible: true,
                type: "error",
                message: "Invalid JSON format",
            }
        } else {
            feedbackToast.value = {
                visible: true,
                type: "error",
                message: error.message,
            }
        }
        setTimeout(() => {
            feedbackToast.value.visible = false;
        }, 8000);
    })
};

const feedbackToast = ref({
    visible: false,
    type: "success",
    message: "",
})
</script>

<template>
    <div>
        <AdminHeader
            variant="upload"
            header-text="Upload Data"
        />
        <div class="flex flex-col gap-4 p-8">
            <UnsafeFileInput
                button-color="info"
                button-text="Upload"
                button-width="block"
                description="This updates the supervisors & their available slots"
                file-type="csv"
                title="Supervisors"
                @file-uploaded="handleCsvUpload"
            />

            <UnsafeFileInput
                button-color="info"
                button-text="Upload"
                button-width="block"
                description="This updates the tags and the similarity scores"
                file-name="select updated_tag_list.json"
                file-type="json"
                title="Tags"
                @file-uploaded="handleJsonUpload"
            />
        </div>
        <Toast
            v-if="feedbackToast.visible"
            :type="feedbackToast.type"
            :message="feedbackToast.message"
            :duration="8000"
            @button-click="feedbackToast.visible = false"
            @close="feedbackToast.visible = false"
        />
    </div>
</template>
