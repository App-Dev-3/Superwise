<script lang="ts" setup>
import { computed, ref } from "vue";
import SupervisorStudentList from "~/components/SupervisorStudentList/SupervisorStudentList.vue";
import { useSupervisionRequests } from "~/composables/useSupervisionRequests";
import type { SupervisorData } from "~/shared/types/supervisorInterfaces";
import type { UserData } from "~/shared/types/userInterfaces";
import { supervisionRequestStatus } from "#shared/enums/enums";

const { user } = useUser();
const userStore = useUserStore();
const { getSupervisorByUserId } = useSupervisorApi();
const { getUserByEmail } = useUserApi();

const current_user = ref<UserData | null>(null);
const supervisor_data = ref<SupervisorData | null>(null);

const {
  data: requests,
  pending,
  error,
  refresh,
} = useSupervisionRequests("ACCEPTED");

const students = computed(() =>
    (requests.value ?? []).map((request) => ({
      id: request.student.user_id,
      firstName: request.student.user.first_name,
      lastName: request.student.user.last_name,
      email: request.student.user.email ?? "",
      src: request.student.user.profile_image ?? "",
    }))
);

watch(
    () => user.value?.primaryEmailAddress?.emailAddress,
    async (email) => {
      if (!email) return;

      if (!userStore.user) {
        const fetched = (await getUserByEmail(email)) as UserData;
        userStore.setUser(fetched);
      }
      current_user.value = userStore.user;

      if (current_user.value?.id) {
        supervisor_data.value = (await getSupervisorByUserId(
            current_user.value.id
        )) as SupervisorData;
      }
    },
    { immediate: true }
);

async function removeStudent(studentId: string) {
  const req = requests.value?.find(
      (request) => request.student.user_id === studentId
  );

  if (!req) return;

  await $fetch(`/api/supervision-requests/${ req.id }`, {
    method: "PATCH",
    body: {
      request_state: supervisionRequestStatus.WITHDRAWN,
    },
  });

  await refresh();
}

async function addStudent(email: string) {
  // This "id" usage is correct based on the current backend, even if you ide says its not
  if (!supervisor_data.value?.id) {
    console.warn("No supervisor ID yet!");
    return;
  }

  const existingStudent = students.value.find(
      (student) => student.email === email
  );

  if (!existingStudent) {
    await $fetch("/api/supervision-requests", {
      method: "POST",
      body: {
        // This "id" usage is correct based on the current backend, even if you ide says its not
        supervisor_id: supervisor_data.value.id,
        student_email: email,
      },
    });
  }
  await refresh();
}


definePageMeta({
  layout: "generic-back-layout",
});
</script>

<template>
  <div class="w-full h-fit flex flex-col gap-2 p-8">
    <span class="text-large">Currently Supervising</span>
    <div
        v-if="pending || error"
        class="w-full h-fit min-h-64 p-4 border border-base-300 rounded-3xl flex flex-col justify-center items-center">
      <div v-if="pending">Loading…</div>
      <div v-else-if="error" class="text-red-600">{{ error.message }}</div>
    </div>
    <!-- your IDE says that total_spots doesnt exists. Its lying. The interfaces are fucked up, we gotta fix that later-->
    <SupervisorStudentList
        v-else
        :max-students="supervisor_data?.total_spots"
        :students="students"
        @add-student="addStudent"
        @remove-student="removeStudent"
    />
  </div>
</template>

<style scoped></style>
