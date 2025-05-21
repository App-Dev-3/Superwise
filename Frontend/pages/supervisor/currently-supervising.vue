<script lang="ts" setup>
import SupervisorStudentList from "~/components/SupervisorStudentList/SupervisorStudentList.vue";
import { useSupervisionRequests } from "~/composables/useSupervisionRequests";

const userStore = useUserStore();
const { getSupervisorByUserId } = useSupervisorApi();

const {
  data: requests,
  pending,
  error,
  refresh,
} = useSupervisionRequests("ACCEPTED");

const students = computed(() =>
  (requests.value ?? []).map((request) => ({
    id: request.student.user.id,
    firstName: request.student.user.first_name,
    lastName: request.student.user.last_name,
    email: request.student.user.email ?? "",
    src: request.student.user.profile_image ?? "",
  }))
);

let supervisorId: string | null = null;
watch(
  () => userStore.user ?? userStore.user?.primaryEmailAddress?.emailAddress,
  async () => {
    if (!userStore.user && userStore.user?.primaryEmailAddress?.emailAddress) {
      const u = await getUserByEmail(
        userStore.user.primaryEmailAddress.emailAddress
      );
      userStore.setUser(u);
    }
    if (userStore.user?.id) {
      const sup = await getSupervisorByUserId(userStore.user.id);
      supervisorId = sup.id;
    }
  },
  { immediate: true }
);

async function removeStudent(studentId: string) {
  const req = requests.value?.find(
    (request) => request.student.user.id === studentId
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
  if (!supervisorId) {
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
        supervisor_id: supervisorId,
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
        <SupervisorStudentList
          v-else
          :max-students="10"
          :students="students"
          @add:students="addStudent"
          @remove:student="removeStudent"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
