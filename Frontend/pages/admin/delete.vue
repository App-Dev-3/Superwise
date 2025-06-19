<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import type { UserData } from "#shared/types/userInterfaces";
import { HttpMethods } from "#shared/enums/enums";

const { t } = useI18n();

const users = ref<{ value: string; label: string }[]>([]);
const selectedUserId = ref("");
const searchQuery = ref("");
const isLoading = ref(false);
const feedbackToast = ref({
  visible: false,
  type: "success" as "success" | "error",
  message: "",
});

const filteredUsers = computed(() => {
  if (!searchQuery.value) return [];

  const query = searchQuery.value.toLowerCase();
  return users.value.filter((user) => user.label.toLowerCase().includes(query));
});

const fetchUsers = async () => {
  try {
    const data = await $fetch<UserData[]>("/api/users", {
      method: HttpMethods.GET,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    users.value = data.map((user) => ({
      value: user.id,
      label: `${user.first_name} ${user.last_name} (${user.email}) - ${user.role}`,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    feedbackToast.value = {
      visible: true,
      type: "error",
      message: t("admin.deleteUser.generalError"),
    };
  }
};

const selectUser = (userId: string) => {
  selectedUserId.value = userId;
  searchQuery.value = "";
};

const deleteUser = async () => {
  if (!selectedUserId.value) {
    feedbackToast.value = {
      visible: true,
      type: "error",
      message: t("admin.deleteUser.selectUserError"),
    };
    return;
  }

  isLoading.value = true;

  try {
    console.log("Starting user reset for ID:", selectedUserId.value);

    const result = await $fetch(
      `/api/admin/users/${selectedUserId.value}/reset`,
      {
        method: HttpMethods.DELETE,
      }
    );

    console.log("User reset successful:", result);

    feedbackToast.value = {
      visible: true,
      type: "success",
      message: result.message,
    };

    selectedUserId.value = "";
    searchQuery.value = "";

    await fetchUsers();
  } catch (error: any) {
    console.error("Error resetting user:", error);

    let errorMessage = t("admin.deleteUser.generalError");

    if (error.statusCode === 403) {
      errorMessage = t("admin.deleteUser.permissionError");
    } else if (error.statusCode === 404) {
      errorMessage = t("admin.deleteUser.userNotFoundError");
    } else if (error.message) {
      errorMessage = error.message;
    }

    feedbackToast.value = {
      visible: true,
      type: "error",
      message: errorMessage,
    };
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchUsers();
});

// Page meta
definePageMeta({
  layout: "generic-back-layout",
});
</script>

<template>
  <div class="size-full flex flex-col gap-4 p-8">
    <div class="bg-base-100 rounded-lg border border-base-300 p-8 shadow-sm">
      <div class="flex flex-col items-center gap-6">
        <div
          class="w-16 h-16 bg-error/10 rounded-lg flex items-center justify-center"
        >
          <FontAwesomeIcon icon="trash-can" class="text-error text-2xl" />
        </div>

        <h2 class="text-header text-base-content">
          {{ t("admin.deleteUser.title") }}
        </h2>

        <div class="w-full max-w-md">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('admin.deleteUser.searchPlaceholder')"
              class="input input-bordered w-full pl-10 focus:input-error"
            />
            <FontAwesomeIcon
              icon="search"
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50"
            />
          </div>
        </div>

        <div class="w-full max-w-md">
          <div v-if="selectedUserId && !searchQuery" class="mb-4">
            <div class="bg-success/10 border border-success/30 rounded-lg p-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-success">{{
                  t("admin.deleteUser.selectedUser")
                }}</span>
                <button
                  @click="selectedUserId = ''"
                  class="btn btn-ghost btn-xs text-error"
                >
                  <FontAwesomeIcon icon="times" />
                </button>
              </div>
              <p class="text-sm text-base-content/80 mt-1">
                {{ users.find((u) => u.value === selectedUserId)?.label }}
              </p>
            </div>
          </div>

          <div
            v-if="searchQuery"
            class="max-h-60 overflow-y-auto border border-base-300 rounded-lg"
          >
            <div
              v-if="filteredUsers.length === 0"
              class="p-4 text-center text-base-content/50"
            >
              {{ t("admin.deleteUser.noUsersFound") }} "{{ searchQuery }}"
            </div>
            <button
              v-for="user in filteredUsers"
              :key="user.value"
              @click="selectUser(user.value)"
              class="w-full text-left p-3 hover:bg-base-200 border-b border-base-300 last:border-b-0 transition-colors"
            >
              <div class="text-sm">{{ user.label }}</div>
            </button>
          </div>

          <div
            v-if="!searchQuery && !selectedUserId"
            class="text-center p-4 text-base-content/50 text-sm"
          >
            {{ t("admin.deleteUser.searchInstruction") }}
          </div>
        </div>

        <p class="text-small text-base-content/70 text-center max-w-md">
          {{ t("admin.deleteUser.description") }}
        </p>

        <CustomButton
          :text="
            isLoading
              ? t('admin.deleteUser.deleting')
              : t('admin.deleteUser.deleteButton')
          "
          :disabled="!selectedUserId || isLoading"
          :is-loading="isLoading"
          :left-icon="isLoading ? 'spinner' : 'trash-can'"
          block
          color="error"
          size="lg"
          class="max-w-md"
          @click="deleteUser"
        />
      </div>
    </div>

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

<style scoped></style>
