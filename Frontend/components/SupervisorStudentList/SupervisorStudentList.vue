<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import StudentCard from "./StudentCard.vue";
import ValidatedMailInput from "./ValidatedMailInput.vue";
import CustomButton from "../CustomButton/CustomButton.vue";
import type { UserData } from "~/shared/types/userInterfaces";
import type { SupervisorData } from "~/shared/types/supervisorInterfaces";
import type CustomModal from "../CustomModal/CustomModal.vue";
import { useSettingsStore } from "~/stores/useSettingsStore";
import { useI18n } from "vue-i18n";
import EmptyPagePlaceholder from "~/components/Placeholder/EmptyPagePlaceholder.vue";

const authStore = useAuthStore();
await authStore.initialize();
const { user } = storeToRefs(authStore);
const userStore = useUserStore();
const { getSupervisorByUserId } = useSupervisorApi();
const { getUserByEmail } = useUserApi();

const { t } = useI18n();

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

// Modal refs
const modalExistingStudentRef = ref<InstanceType<typeof CustomModal> | null>(
  null
);
const modalNotExistingStudentRef = ref<InstanceType<typeof CustomModal> | null>(
  null
);
const removeModalRef = ref<InstanceType<typeof CustomModal> | null>(null);

// Track which student is pending removal
const studentToRemove = ref<Student | null>(null);

// Handle edit button click
const isEditing = ref(false);
const toggleEdit = () => {
  isEditing.value = !isEditing.value;
};

const modal_user = ref<UserData | null>(null);

// Emit events when students are updated
const emit = defineEmits(["remove-student", "add-student"]);

// Function to prompt remove confirmation
const promptRemoveStudent = (student: Student) => {
  if (!isEditing.value) return;
  studentToRemove.value = student;
  removeModalRef.value?.show();
};

// Confirm removal
const confirmRemoveStudent = () => {
  if (studentToRemove.value) {
    emit("remove-student", studentToRemove.value.id);
    studentToRemove.value = null;
  }
};

const emailAddress = ref("");
const clearInput = ref(false);
const emailDomain = "fhstp.ac.at";

const updateMail = (value: string) => {
  emailAddress.value = value;
};

const editButtonLabel = computed(() => (isEditing.value ? "Done" : "Edit"));
const editButtonIcon = computed(() => (isEditing.value ? "check" : "edit"));

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
    emit("add-student", emailAddress.value);
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
        <NuxtLink
          v-for="student in students"
          :key="student.id"
          :to="!isEditing ? `/profiles/${student.id}` : ''"
          actions
          comment-more
        >
          <StudentCard
            :edit-mode="isEditing"
            :email="student.email"
            :first-name="student.firstName"
            :img-src="student.src"
            :last-name="student.lastName"
            @click="() => promptRemoveStudent(student)"
          />
        </NuxtLink>
        <EmptyPagePlaceholder
          :render-condition="students"
          :text="t('supervisor.noStudents')"
        />
      </div>

      <div class="flex flex-row gap-3 w-full">
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

    <!-- Removal Confirmation Modal -->
    <CustomModal
      ref="removeModalRef"
      :image-alt="
        studentToRemove
          ? 'Profile image of ' +
            studentToRemove?.firstName +
            ' ' +
            studentToRemove?.lastName
          : ''
      "
      :image-src="studentToRemove?.src || getPlaceholderImage(studentToRemove?.firstName, studentToRemove?.lastName) || ''"
      :main-text="
        t('supervisorStudentList.removeStudent.mainText', {
          firstName: studentToRemove?.firstName,
          lastName: studentToRemove?.lastName,
        })
      "
      :confirm-text="t('supervisorStudentList.removeStudent.confirmText')"
      :checkbox-label="t('supervisorStudentList.checkboxLabel')"
      setting-key="showRemoveStudentModal"
      :title="t('supervisorStudentList.removeStudent.title')"
      icon="trash"
      @confirm="confirmRemoveStudent"
    />

    <!-- Existing Student Modal -->
    <CustomModal
      ref="modalExistingStudentRef"
      :email="modal_user?.email"
      :image-alt="
        modal_user
          ? 'Profile image of ' +
            modal_user.first_name +
            ' ' +
            modal_user.last_name
          : ''
      "
      :image-src="modal_user?.profile_image || getPlaceholderImage(modal_user?.first_name, modal_user?.last_name) || ''"
      :main-text="
        t('supervisorStudentList.addExistingStudent.mainText', {
          firstName: modal_user?.first_name,
          lastName: modal_user?.last_name,
        })
      "
      :show-checkbox="true"
      :checkbox-label="t('supervisorStudentList.checkboxLabel')"
      :confirm-text="t('supervisorStudentList.addExistingStudent.confirmText')"
      icon="user-group"
      setting-key="showAddStudentModal"
      :sub-text="t('supervisorStudentList.addExistingStudent.subText')"
      :title="t('supervisorStudentList.addExistingStudent.title')"
      @confirm="addStudent"
    />

    <!-- Not Existing Student Modal -->
    <CustomModal
      ref="modalNotExistingStudentRef"
      :email="emailAddress"
      :main-text="
        t('supervisorStudentList.addNewStudent.mainText', {
          emailAddress: emailAddress,
        })
      "
      :show-checkbox="true"
      :checkbox-label="t('supervisorStudentList.checkboxLabel')"
      confirm-text=""
      icon="user-group"
      image-alt="Logo"
      image-src="../images/Superwise_Logo.svg"
      setting-key="showAddStudentModal"
      :sub-text="t('supervisorStudentList.addExistingStudent.subText')"
      :title="t('supervisorStudentList.addNewStudent.title')"
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
