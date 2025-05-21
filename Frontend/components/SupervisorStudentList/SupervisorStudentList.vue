<script lang="ts" setup>
import { computed, ref } from "vue";
import StudentCard from "./StudentCard.vue";
import ValidatedMailInput from "./ValidatedMailInput.vue";
import CustomButton from "../CustomButton/CustomButton.vue";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imgSrc: string;
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

const { getUserByEmail } = useUserApi();

const modalExistingStudentRef = ref<HTMLDialogElement | null>(null);
const modalNotExistingStudentRef = ref<HTMLDialogElement | null>(null);

// Handle edit button click
const isEditing = ref(false);
const toggleEdit = () => {
  isEditing.value = !isEditing.value;
};

const current_user = ref<UserData | null>(null);

// Emit events when students are updated
const emit = defineEmits(["remove:student", "add:students"]);

// Function to remove a student
const removeStudent = (studentId: string) => {
  if (!isEditing.value) {
    return;
  }

  emit("remove:student", studentId);
};

const emailAddress = ref("");
const clearInput = ref(false);
const emailDomain = "fhstp.ac.at";

const updateMail = (value: string) => {
  emailAddress.value = value;
};

const editButtonLabel = computed(() => {
  return isEditing.value ? "Done" : "Edit";
});

const editButtonIcon = computed(() => {
  return isEditing.value ? "check" : "edit";
});

const confirm = async () => {
  if (!emailAddress.value) return;

  try {
    current_user.value = await getUserByEmail(emailAddress.value);

    modalExistingStudentRef.value?.showModal();
  } catch (err: any) {
    if (err.statusCode === 404) {
      modalNotExistingStudentRef.value?.showModal();
    } else {
      console.error("Unexpected error:", err);
    }
  }
};

const addStudent = () => {
  if (emailAddress.value) {
    // const email = `${emailAddress.value}@${emailDomain}`;
    emit("add:students", emailAddress.value);

    // Clear the input
    clearInput.value = true;
    emailAddress.value = "";
  }
};
</script>

<template>
  <div class="bg-base-100 rounded-3xl border-1 border-base-300 flex flex-col">
    <div class="flex flex-col w-full gap-4 px-8 py-3">
      <div class="flex flex-row w-full justify-between items-center px-2">
        <span class="text-x-small"
          >{{ props.students.length }}/{{ props.maxStudents }}</span
        >
        <CustomButton
          :left-icon="editButtonIcon"
          :text="editButtonLabel"
          color="default"
          size="xs"
          variant="ghost"
          @click="toggleEdit"
        />
      </div>

      <div
        class="min-h-64 max-h-96 overflow-y-auto flex flex-col gap-2 border-t border-b border-base-300"
      >
        <!-- Student List -->
        <StudentCard
          v-for="student in students"
          :key="student.id"
          :edit-mode="isEditing"
          :email="student.email"
          :first-name="student.firstName"
          :img-src="student.imgSrc"
          :last-name="student.lastName"
          @click="removeStudent(student.id)"
        />
      </div>

      <div v-if="isEditing" class="flex flex-row gap-3 w-full">
        <ValidatedMailInput
          :clear-input="clearInput"
          :domain="emailDomain"
          error-message="Invalid email address"
          placeholder="Add Student..."
          @update:model-value="updateMail"
          @update:input-cleared="clearInput = false"
        />
        <CustomButton
          color="default"
          left-icon="plus"
          text=""
          @click="confirm"
        />
      </div>
    </div>
    <!-- TODO Move modal to own component; Make pretty like design; Test that addStudent works   -->
    <dialog ref="modalExistingStudentRef" class="modal">
      <div class="modal-box w-11/12 max-w-5xl">
        <form method="dialog">
          <button class="btn btn-md btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="text-lg font-bold">
          Supervise Student
          <FontAwesomeIcon icon="user-group" class="text-lg" />
        </h3>
        <div>
          <img
            :src="current_user.profile_image"
            :alt="
              'Profile image of ' +
              current_user.first_name +
              ' ' +
              current_user.last_name
            "
            class="h-6 mb-8"
          />
          <p class="text-grey-300">{{ current_user.email }}</p>
        </div>
        <p class="py-4">
          Would you like to supervise {{ current_user.first_name }}
          {{ current_user.last_name }}?
        </p>
        <p class="text-grey-300">
          They will get notified that you are supervising them!
        </p>
        <div class="modal-action">
          <form method="dialog">
            <CustomButton
              class="btn mr-2"
              @click="addStudent"
              text="Add student"
            />
            <CustomButton class="btn mr-2" text="Close" />
          </form>
        </div>
      </div>
    </dialog>

    <dialog ref="modalNotExistingStudentRef" class="modal">
      <div class="modal-box w-11/12 max-w-5xl">
        <form method="dialog">
          <button class="btn btn-md btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="text-lg font-bold">
          Supervise Student
          <FontAwesomeIcon icon="user-group" class="text-lg" />
        </h3>
        <div>
          <img src="../images/Superwise_Logo.svg" alt="Logo" class="h-6 mb-8" />
          <p class="text-grey-300">{{ emailAddress }}</p>
        </div>
        <p class="py-4">
          Would you like to supervise {{ emailAddress }}? They are not
          registered on SuperWise, but will get notified via mail.
        </p>
        <p class="text-grey-300">
          They will get notified that you are supervising them!
        </p>
        <div class="modal-action">
          <form method="dialog">
            <CustomButton
              class="btn mr-2"
              @click="addStudent"
              text="Add student"
            />
            <CustomButton class="btn mr-2" text="Close" />
          </form>
        </div>
      </div>
    </dialog>
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
