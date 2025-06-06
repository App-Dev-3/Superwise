<script lang="ts" setup>
import { HttpMethods, supervisionRequestStatus } from "#shared/enums/enums";
import { exportCsv } from "~/utils/csvHelpers";

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
        const csvData: csvMatchExportRow[] = res.map((request) => {
          return {
            "Supervisor First Name": request.supervisor.user.first_name,
            "Supervisor Last Name": request.supervisor.user.last_name,
            "Supervisor Email": request.supervisor.user.email,
            "Student First Name": request.student.user.first_name,
            "Student Last Name": request.student.user.last_name,
            "Student Email": request.student.user.email,
            "Confirmed at": request.updated_at ?
                new Date(request.updated_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    }
                )
                : "No Date Available",
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

definePageMeta({
  layout: "generic-back-layout",
});
</script>

<template>
  <div class="size-full flex flex-col gap-4 p-8">
    <FileDownload
        button-color="success"
        button-text="Download"
        button-width="block"
        description="Download the confirmed Supervisor - Student pairs"
        file-name="Download confirmed_supervisions.csv"
        title="Download confirmed Supervisions"
        @click="downloadConfirmedSupervisions"
    />
    <Toast
        v-if="feedbackToast.visible"
        :duration="8000"
        :message="feedbackToast.message"
        :type="feedbackToast.type"
        @button-click="feedbackToast.visible = false"
    />
  </div>
</template>
