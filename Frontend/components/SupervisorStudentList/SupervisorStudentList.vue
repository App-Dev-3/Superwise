<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import StudentCard from "./StudentCard.vue";
import ValidatedMailInput from "./ValidatedMailInput.vue";
import CustomButton from "../CustomButton/CustomButton.vue";
import type { UserData } from "~/shared/types/userInterfaces";
import type { SupervisorData } from "~/shared/types/supervisorInterfaces";
import type CustomModal from "../CustomModal/CustomModal.vue";
import { useSettingsStore } from "~/stores/useSettingsStore";

const { user } = useUser();
const userStore = useUserStore();
const { getSupervisorByUserId } = useSupervisorApi();
const { getUserByEmail } = useUserApi();

const current_user = ref<UserData | null>(null);
const supervisor_data = ref<SupervisorData | null>(null);

const settingsStore = useSettingsStore();

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
  maxStudents: number | undefined;
}

// Define props for the component
const props = defineProps<SupervisorStudentListProps>();

const modalExistingStudentRef = ref<InstanceType<typeof CustomModal> | null>(
  null
);
const modalNotExistingStudentRef = ref<InstanceType<typeof CustomModal> | null>(
  null
);

// Handle edit button click
const isEditing = ref(false);
const toggleEdit = () => {
  isEditing.value = !isEditing.value;
};

const modal_user = ref<UserData | null>(null);

// Emit events when students are updated
const emit = defineEmits(["remove-student", "add-student"]);

// Function to remove a student
const removeStudent = (studentId: string) => {
  if (!isEditing.value) {
    return;
  }

  emit("remove-student", studentId);
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
  if (!settingsStore.showAddStudentModal) {
    addStudent();
    return;
  }
  try {
    modal_user.value = await getUserByEmail(emailAddress.value);

    modalExistingStudentRef.value?.show();
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "statusCode" in err &&
      (err as { statusCode: number }).statusCode === 404
    ) {
      modalNotExistingStudentRef.value?.show();
    } else {
      console.error("Unexpected error:", err);
    }
  }
};

const addStudent = () => {
  if (emailAddress.value) {
    // const email = `${emailAddress.value}@${emailDomain}`;
    emit("add-student", emailAddress.value);

    // Clear the input
    clearInput.value = true;
    emailAddress.value = "";
  }
};

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
          :img-src="student.src"
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
          @keyup.enter="confirm"
        />
        <CustomButton
          color="default"
          left-icon="plus"
          text=""
          @click="confirm"
        />
      </div>
    </div>

    <CustomModal
      ref="modalExistingStudentRef"
      title="Supervise Student"
      icon="user-group"
      :image-src="modal_user?.profile_image || undefined"
      :image-alt="
        modal_user
          ? 'Profile image of ' +
            modal_user.first_name +
            ' ' +
            modal_user.last_name
          : ''
      "
      :email="modal_user?.email"
      :main-text="`Would you like to supervise ${modal_user?.first_name} ${modal_user?.last_name}?`"
      sub-text="They will get notified that you are supervising them!"
      :show-checkbox="true"
      checkbox-label="Don't show again"
      setting-key="showAddStudentModal"
      confirm-text="Supervise Student"
      @confirm="addStudent"
    />

    <CustomModal
      ref="modalNotExistingStudentRef"
      title="Supervise Student"
      icon="user-group"
      image-src="../images/Superwise_Logo.svg"
      image-alt="Logo"
      :email="emailAddress"
      :main-text="`Would you like to supervise ${emailAddress}? They are not registered on SuperWise, but will get notified via mail.`"
      sub-text="They will get notified that you are supervising them!"
      :show-checkbox="true"
      checkbox-label="Don't show again"
      setting-key="showAddStudentModal"
      confirm-text="Supervise Student"
      @confirm="addStudent"
    />
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
