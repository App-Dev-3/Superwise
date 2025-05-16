<script lang="ts" setup>
import {computed, ref} from 'vue';
import StudentCard from "./StudentCard.vue";
import ValidatedMailInput from "./ValidatedMailInput.vue";
import CustomButton from "../CustomButton/CustomButton.vue";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  src: string;
  online?: boolean;
}

interface SupervisorStudentListProps {
  students: Student[];
  maxStudents?: number;
}

// Define props for the component
const props = withDefaults(defineProps<SupervisorStudentListProps>(), {
  maxStudents: 12,
});

// Change to computed property to react to prop changes
const maxStudents = computed(() => props.maxStudents || 12);

// Handle edit button click
const isEditing = ref(false);
const toggleEdit = () => {
  isEditing.value = !isEditing.value;
};

// Emit events when students are updated
const emit = defineEmits(['remove:student', 'add:students']);

// Function to remove a student
const removeStudent = (studentId: string) => {
  if (!isEditing.value) {
    return;
  }

  emit('remove:student', studentId);
};

const emailAddress = ref('');
const emailDomain = 'fhstp.ac.at';

const editButtonLabel = computed(() => {
  return isEditing.value ? 'Done' : 'Edit';
});

const editButtonIcon = computed(() => {
  return isEditing.value ? 'check' : 'edit';
});

const addStudent = () => {
  if (emailAddress.value) {
    const email = `${emailAddress.value}@${emailDomain}`;
    emit('add:students', email);

    // Clear the input
    emailAddress.value = '';
  }
};
</script>

<template>
  <div class="bg-base-100 rounded-3xl border-1 border-base-300 flex flex-col">
    <div class="flex flex-col w-full gap-4 px-8 py-3">
      <div class="flex flex-row w-full justify-between items-center px-2">
        <span class="text-x-small">{{ students.length }}/{{ maxStudents }}</span>
        <CustomButton
            :left-icon="editButtonIcon"
            :text="editButtonLabel"
            color="default"
            size="xs"
            variant="ghost"
            @click="toggleEdit"
        />
      </div>

      <div class="min-h-64 max-h-96 overflow-y-auto flex flex-col gap-2 border-t border-b border-base-300">
        <!-- Student List -->
        <StudentCard
            v-for="student in students"
            :key="student.id"
            :edit-mode="isEditing"
            :email="student.email"
            :first-name="student.firstName"
            :last-name="student.lastName"
            :src="student.src"
            @click="removeStudent(student.id)"
        />


      </div>


      <div
          class="flex flex-row gap-3 w-full"
      >
        <ValidatedMailInput
            v-model="emailAddress"
            :domain="emailDomain"
            error-message="Invalid email address"
            placeholder="Add Student..."
        />
        <CustomButton
            color="default"
            left-icon="plus"
            text=""
            @click="addStudent"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.border-1 {
  border-width: 1px;
}

.text-x-small {
  font-size: 0.75rem;
}
</style>
