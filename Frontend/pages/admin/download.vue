<script setup lang="ts">
import {HttpMethods, supervisionRequestStatus} from "#shared/enums/enums";
import { exportCsv} from "~/utils/csvHelpers";

const feedbackToast = ref({
    visible: false,
    type: "success",
    message: "",
})

const downloadConfirmedSupervisions = () => {
    $fetch("/api/supervision-requests", {
        method: HttpMethods.GET,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        query: {
            request_state: supervisionRequestStatus.ACCEPTED,
        },
    }).then(
        (res) => {
            console.log(res);
            const csvData :csvMatchExportRow[] = res.map((request) => {
                return {
                    "Supervisor First Name": request.supervisor.user.first_name,
                    "Supervisor Last Name": request.supervisor.user.last_name,
                    "Supervisor Email": request.supervisor.user.email,
                    "Student First Name": request.student.user.first_name,
                    "Student Last Name": request.student.user.last_name,
                    "Student Email": request.student.user.email,
                }
            });
            exportCsv(csvData, "confirmed_supervisions.csv");
        }
    ).catch((error) => {
        feedbackToast.value = {
            visible: true,
            type: "error",
            message: error.message,
        }
        setTimeout(() => {
            feedbackToast.value.visible = false;
        }, 8000);
    })
}
</script>

<template>
    <div>
        <AdminHeader
            variant="download"
            header-text="Download Data"
        />
        <div class="flex flex-col gap-4 p-8">
            <FileDownload
                button-color="success"
                button-text="Download"
                button-width="block"
                description="Download the confirmed Supervisor - Student pairs"
                file-name="Download confirmed_supervisions.csv"
                title="Download confirmed Supervisions"
                @click="downloadConfirmedSupervisions"
            />
        </div>
        <Toast
            v-if="feedbackToast.visible"
            :type="feedbackToast.type"
            :message="feedbackToast.message"
            :duration="8000"
            @button-click="feedbackToast.visible = false"
        />
    </div>
</template>
