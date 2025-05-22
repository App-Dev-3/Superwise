<template>
  <div class="w-full h-screen flex flex-col justify-center items-center">
    <AdminHeader
      :header-text="$t('generic.profile')"
      @right-button-click="navigateToPreview"
    />
    <div class="w-full h-full overflow-y-auto p-6 flex flex-col gap-4">
      <div class="w-full flex flex-col items-center gap-3 justify-center pt-6 px-4">
        <Avatar
          :emoji="emoji"
          :first-name="userData.first_name"
          :img-src="userData.profile_image"
          :last-name="userData.last_name"
          ring-color="info"
          shape="circle"
          size="lg"
        />

        <CustomTag
          :text="$t('role.'+userData.role.toLowerCase())"
          class="opacity-50"
          color="default"
          left-icon="fa-solid fa-tag"
          size="lg"
          variant="outline"
        />

        <div class="flex flex-col items-center gap-1">
          <h1 class="text-header">
            {{ userData.first_name }} {{ userData.last_name }}
          </h1>
          <p class="text-x-small opacity-50">
            {{ userData.email }}
          </p>
        </div>

        <div class="flex flex-row gap-2 w-full justify-center">
          <CustomButton
            :text="$t('generic.mail')"
            block
            color="default"
            left-icon="envelope"
            @click="sendMail"
          />

          <CustomButton
            v-if="userData.role !== 'ADMIN'"
            :text="isStudent ? $t('generic.supervise') : $t('generic.supervisionRequest')"
            block
            color="default"
            left-icon="message"
            @click="sendSupervisionRequest"
          />
        </div>
      </div>


      <div
        v-if="userData.is_registered && !userData.is_deleted"
        class="w-full h-full flex flex-col gap-4">

        <hr v-if="!isAdmin" class="border-base-300 text-base-300">

        <SupervisorStatistics
          v-if="isSupervisor"
          :compatability="compatability"
          :currently-supervising="userData.supervisor_profile.current_slots"
          :first-name="userData.first_name"
          :last-name="userData.last_name"
          :pending="pending"
          :slots="userData.supervisor_profile.max_slots"
        />
        <hr v-if="isSupervisor" class="border-base-300 text-base-300">

        <div v-if="!isAdmin" class="p-3">

          <ProfileDescription
            :content="isStudent ? userData.student_profile.thesis_description : userData.supervisor_profile.bio"
            :headline="isStudent ? $t('generic.thesisDescription') : 'Bio'"
          />
        </div>

        <hr v-if="!isAdmin" class="border-base-300 text-base-300">

        <div v-if="!isAdmin" class="w-full flex justify-center flex-col p-4 gap-3">
          <div
            class="w-full flex flex-row flex-wrap gap-2 justify-center">
            <CustomTag
              v-for="(tag, index) in userData.tags"
              :key="`selected-${index}`"
              :color="viewerTags.some(viewerTag => viewerTag.tag.id === tag.tag.id) ? 'primary' : 'default'"
              :text="tag.tag.tag_name"
              @delete="removeTag(tag)"
            />
          </div>
        </div>
      </div>

      <div
        v-else class="pt-4">

        <hr class="border-base-300 text-base-300">

        <div class="alert alert-warning" role="alert">
          <FontAwesomeIcon
            class="opacity-75"
            icon="warning"
          />
          <span>Warning:
            <span class="font-bold">
              {{ userData.first_name }} {{ userData.last_name }}
            </span>
            is not registered yet. Please either contact them via email or teams.
          </span>
        </div>
      </div>
    </div>
  </div>
</template>


<script lang="ts" setup>
import {ref} from 'vue';
import CustomButton from "~/components/CustomButton/CustomButton.vue";
import type {tagData} from "#shared/types/tagInterfaces";
import {useRouter} from 'vue-router';
import ProfileDescription from "~/components/ProfileViewComponents/ProfileDescription.vue";
import SupervisorStatistics from "~/components/ProfileViewComponents/SupervisorStatistics.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

const router = useRouter();


const sendMail = () => {
  // TODO: open mailto
}

const sendSupervisionRequest = () => {
  // TODO: send supervision request
}

const emoji = computed(() => {
  switch (userData.value.role) {
    case 'STUDENT':
      return '🎓';
    case 'SUPERVISOR':
      return '👨‍🏫';
    case 'ADMIN':
      return '⚙️';
    default:
      return '👤';
  }
});

const navigateToPreview = () => {
  // Navigate to the profile preview page
  // TODO: implement the logic, this is only a placeholder
  router.push('/profile-preview');
};

const removeTag = (tag: tagData) => {
  tags.value = tags.value.filter(t => t.id !== tag.id);
};

const isAdmin = computed(() => {
  return userData.value.role === 'ADMIN';
});

const isSupervisor = computed(() => {
  return userData.value.role === 'SUPERVISOR';
});

const isStudent = computed(() => {
  return userData.value.role === 'STUDENT';
});

const viewerTags = ref([
  {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "tag_id": "abc4567-e89b-12d3-a456-426614174001",
    "priority": 1,
    "tag": {
      "id": "abc4567-e89b-12d3-a456-426614174001",
      "tag_name": "Machine Learning",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    },
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  },
  {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "tag_id": "def4567-e89b-12d3-a456-426614174002",
    "priority": 2,
    "tag": {
      "id": "def4567-e89b-12d3-a456-426614174012",
      "tag_name": "Beer",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    },
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
] as tagData[]);

const userData = ref({
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "clerk_id": "user_2VgdKDGF1Y3oMf4QmIaYM0uyvlY",
    "email": "studentId@fhstp.ac.at",
    "first_name": "Max",
    "last_name": "Mustermann",
    "role": "STUDENT",
    "profile_image": "https://example.com/images/profile.jpg",
    "is_registered": false,
    "is_deleted": false,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z",
    "student_profile": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "thesis_description": "AI-based recommendation system for supervisor matching",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    },
    "supervisor_profile": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "bio": "I specialize in AI and machine learning with 15+ years of industry and academic experience. My current research focuses on ethical AI applications in healthcare. I enjoy mentoring students who are passionate about pushing the boundaries of technology.",
      "max_slots": 5,
      "current_slots": 2,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    },
    "tags": [
      {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "tag_id": "abc4567-e89b-12d3-a456-426614174001",
        "priority": 1,
        "tag": {
          "id": "abc4567-e89b-12d3-a456-426614174001",
          "tag_name": "Machine Learning",
          "created_at": "2023-01-01T00:00:00Z",
          "updated_at": "2023-01-01T00:00:00Z"
        },
        "created_at": "2023-01-01T00:00:00Z",
        "updated_at": "2023-01-01T00:00:00Z"
      },
      {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "tag_id": "def4567-e89b-12d3-a456-426614174002",
        "priority": 2,
        "tag": {
          "id": "def4567-e89b-12d3-a456-426614174002",
          "tag_name": "Data Science",
          "created_at": "2023-01-01T00:00:00Z",
          "updated_at": "2023-01-01T00:00:00Z"
        },
        "created_at": "2023-01-01T00:00:00Z",
        "updated_at": "2023-01-01T00:00:00Z"
      }
    ],
    "blocked_users": [
      {
        "blocker_id": "123e4567-e89b-12d3-a456-426614174000",
        "blocked_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "created_at": "2023-01-01T00:00:00Z",
        "updated_at": "2023-01-01T00:00:00Z"
      }
    ],
    "blocked_by_users": [
      {
        "blocker_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "blocked_id": "123e4567-e89b-12d3-a456-426614174000",
        "created_at": "2023-01-01T00:00:00Z",
        "updated_at": "2023-01-01T00:00:00Z"
      }
    ]
  }
);

// TODO: make these values dynamic
const compatability = ref(75);
const pending = ref(1);
</script>
