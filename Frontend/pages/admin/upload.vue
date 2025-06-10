<script lang="ts" setup>
import type { ParsedCsv, TagSimilarityData, } from "#shared/types/fileUploadTypes";
import { transformCsvDataToImportFormat } from "~/utils/csvHelpers";
import { HttpMethods } from "#shared/enums/enums";

const { t } = useI18n();

const handleCsvUpload = (filename: string, content: ParsedCsv) => {
  const transformedData = transformCsvDataToImportFormat(content);

  $fetch("/api/admin/supervisors/bulk-import", {
    method: HttpMethods.POST,
    body: transformedData,
    headers: {
      "Content-Type": "application/json",
    },
  })
      .then((res) => {
        feedbackToast.value = {
          visible: true,
          type: "success",
          message: res.message,
        };
        setTimeout(() => {
          feedbackToast.value.visible = false;
        }, 8000);
      })
      .catch((error) => {
        if (error.status === 400) {
          feedbackToast.value = {
            visible: true,
            type: "error",
            message: t("admin.invalidCSV"),
          };
        } else {
          feedbackToast.value = {
            visible: true,
            type: "error",
            message: error.message,
          };
        }
        setTimeout(() => {
          feedbackToast.value.visible = false;
        }, 8000);
      });
};
const handleJsonUpload = (filename: string, content: TagSimilarityData) => {
  $fetch("/api/admin/tags/bulk-import", {
    method: HttpMethods.POST,
    body: content,
    headers: {
      "Content-Type": "application/json",
    },
  })
      .then((res) => {
        feedbackToast.value = {
          visible: true,
          type: "success",
          message: res.message,
        };
        setTimeout(() => {
          feedbackToast.value.visible = false;
        }, 8000);
      })
      .catch((error) => {
        if (error.status === 400) {
          feedbackToast.value = {
            visible: true,
            type: "error",
            message: t("admin.invalidJSON"),
          };
        } else {
          feedbackToast.value = {
            visible: true,
            type: "error",
            message: error.message,
          };
        }
        setTimeout(() => {
          feedbackToast.value.visible = false;
        }, 8000);
      });
};

const feedbackToast = ref({
  visible: false,
  type: "success",
  message: "",
});

definePageMeta({
  layout: "generic-back-layout",
});
</script>

<template>
  <div class="flex flex-col gap-4 p-8">
    <UnsafeFileInput
        :button-text="t('generic.upload')"
        :description="t('admin.uploadSupervisorsDescription')"
        :file-name="t('admin.uploadSupervisorsFileName')"
        :title="t('generic.supervisors')"
        button-color="info"
        button-width="block"
        file-type="csv"
        @file-uploaded="handleCsvUpload"
    />

    <UnsafeFileInput
        :button-text="t('generic.upload')"
        :description="t('admin.uploadTagsDescription')"
        :file-name="t('admin.uploadTagsFileName')"
        :title="t('generic.tags')"
        button-color="info"
        button-width="block"
        file-type="json"
        @file-uploaded="handleJsonUpload"
    />
    <Toast
        v-if="feedbackToast.visible"
        :duration="8000"
        :message="feedbackToast.message"
        :type="feedbackToast.type"
        @close="feedbackToast.visible = false"
        @button-click="feedbackToast.visible = false"
    />
  </div>
</template>
