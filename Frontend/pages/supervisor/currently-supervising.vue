<script lang="ts" setup>
import { computed, ref } from "vue";
import SupervisorStudentList from "~/components/SupervisorStudentList/SupervisorStudentList.vue";
import { useSupervisionRequests } from "~/composables/useSupervisionRequests";
import type { SupervisorData } from "~/shared/types/supervisorInterfaces";
import type { UserData } from "~/shared/types/userInterfaces";

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

  await $fetch(`/api/supervision-requests/${req.id}`, {
    method: "PATCH",
    body: {
      request_state: "REJECTED",
    },
  });

  await refresh();
}

async function addStudent(email: string) {
  if (!supervisor_data.value?.supervisorId) {
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
        supervisor_id: supervisor_data.value.id,
        student_email: email,
      },
    });
  }
  await refresh();
}
</script>

<template>
  <div class="flex flex-col items-center px-2 max-w-full">
    <div class="min-h-screen flex flex-col max-w-7xl w-full">
      <AdminHeader header-text="Edit Supervising Students" />
      <div class="w-full flex flex-col gap-4 p-8 overflow-y-auto">
        <span class="text-large">Currently Supervising</span>
        <div v-if="pending">Loading…</div>
        <div v-else-if="error" class="text-red-600">{{ error.message }}</div>
<!-- your IDE says that total_spots doesnt exists. Its lying. The interfaces are fucked up, we gotta fix that later-->
        <SupervisorStudentList
          v-else
          :students="students"
          :max-students="supervisor_data?.total_spots"
          @add-student="addStudent"
          @remove-student="removeStudent"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
