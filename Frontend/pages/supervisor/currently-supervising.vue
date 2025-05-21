<script lang="ts" setup>
import { ref } from "vue";
import SupervisorStudentList from "~/components/SupervisorStudentList/SupervisorStudentList.vue";
definePageMeta({
  layout: "landing-layout",
});
// Mock data for SupervisorStudentList - use ref for reactivity
const mockStudents = ref([
  {
    id: "student-001",
    firstName: "John",
    lastName: "Doe",
    email: "cc221000@fhstp.ac.at",
    src: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "student-002",
    firstName: "Emma",
    lastName: "Schmidt",
    email: "cc221001@fhstp.ac.at",
    src: "https://randomuser.me/api/portraits/women/33.jpg",
  },
  {
    id: "student-003",
    firstName: "Michael",
    lastName: "Weber",
    email: "cc221002@fhstp.ac.at",
    src: "https://randomuser.me/api/portraits/men/54.jpg",
  },
  {
    id: "student-004",
    firstName: "Sophie",
    lastName: "Müller",
    email: "cc221003@fhstp.ac.at",
    src: "https://randomuser.me/api/portraits/women/22.jpg",
  },
  {
    id: "student-005",
    firstName: "Lucas",
    lastName: "Bauer",
    email: "cc221004@fhstp.ac.at",
    src: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "student-006",
    firstName: "Anna",
    lastName: "Hofer",
    email: "cc221005@fhstp.ac.at",
    src: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: "student-007",
    firstName: "David",
    lastName: "Wagner",
    email: "cc221006@fhstp.ac.at",
    src: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    id: "student-008",
    firstName: "Julia",
    lastName: "Gruber",
    email: "cc221007@fhstp.ac.at",
    src: "https://randomuser.me/api/portraits/women/89.jpg",
  },
]);
const removeStudent = (studentId) => {
  // Find the index of the student to remove
  const index = mockStudents.value.findIndex(
    (student) => student.id === studentId
  );
  if (index !== -1) {
    // Remove the student from the array
    mockStudents.value.splice(index, 1);
  }
};
const addStudent = (email) => {
  // Check if the email already exists
  const existingStudent = mockStudents.value.find(
    (student) => student.email === email
  );
  if (!existingStudent) {
    // Add a new student with a random name and the provided email
    const id = mockStudents.value.length + 1;
    const newStudent = {
      id: `student-${id}`,
      firstName: "New",
      lastName: "Student",
      email: email,
      src: `https://randomuser.me/api/portraits/${
        id % 2 === 0 ? "men" : "women"
      }/${mockStudents.value.length + 1}.jpg`,
    };
    mockStudents.value.push(newStudent);
  } else {
    // If the student already exists, you can handle it here (e.g., show a message)
    console.log("Student already exists:", existingStudent);
  }
};
</script>

<template>
  <div class="w-full h-screen">
    <AdminHeader header-text="Edit Supervising Students" />
    <div class="w-full flex flex-col gap-4 p-8 overflow-y-auto">
      <span class="text-large">Currently Supervising</span>
      <SupervisorStudentList
        :max-students="10"
        :students="mockStudents"
        @add:students="addStudent"
        @remove:student="removeStudent"
      />
    </div>
  </div>
</template>

<style scoped></style>
