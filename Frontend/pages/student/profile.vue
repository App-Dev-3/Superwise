<template>
  <div class="size-full flex flex-col justify-center items-center">
    <div
        class="size-full overflow-y-auto p-6 flex flex-col gap-4"
    >
      <div class="w-full flex justify-center py-16 px-8">
        <PictureUpload
            :first-name="firstName"
            :img-src="imgSrc"
            :last-name="lastName"
            emoji="🎓"
            ring-color="info"
            size="xl"
            @file-uploaded="updateProfileImage"
        />
      </div>

      <hr class="border-base-300 text-base-300">

      <div class="w-full flex justify-center flex-col p-4 gap-3">
        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend text-sm font-semibold mb-1 opacity-50 my-0 py-1">
            {{ t('profile.firstName') }}
          </legend>
          <input
              v-model="firstName"
              :placeholder="t('profile.firstName')"
              class="input w-full"
              type="text"
              @keyup.enter="handleSave"
          >
        </fieldset>
        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend text-sm font-semibold mb-1 opacity-50 my-0 py-1">
            {{ t('profile.lastName') }}
          </legend>
          <input
              v-model="lastName"
              :placeholder="t('profile.lastName')"
              class="input w-full"
              type="text"
              @keyup.enter="handleSave"
          >
        </fieldset>
      </div>
      <hr class="border-base-300 text-base-300">

      <!--        TODO:MAKE TAGS EDITABLE-->
      <div class="w-full flex justify-center flex-col p-4 gap-3">
        <div class="w-full flex flex-row flex-wrap gap-2 justify-center">
          <CustomTag
              v-for="tag in tags"
              :key="tag.tag.tag_id"
              :text="tag.tag.tag_name"
          />
        </div>
        <CustomButton
            :text="t('generic.edit')"
            color="default"
            left-icon="edit"
            size="xs"
            variant="ghost"
            @click="navigateToEditTags"
        />
      </div>

      <hr class="border-base-300 text-base-300">

      <TextArea
          v-model="topicDescription"
          :label-bottom="t('profile.topicVisibility')"
          :label-top="t('profile.thesisTopic')"
          :maxlength="1000"
          :placeholder="t('profile.topicPlaceholder')"
          :rows="8"
          class="w-full"
          name="topic-description"
          @keyup.ctrl.enter="handleSave"
      />
    </div>
    <div
        v-if="userHasChanged || studentProfileHasChanged"
        class="w-full h-fit flex justify-center p-4 border-t border-t-base-300"
    >
      <CustomButton
          :is-loading="buttonIsLoading"
          :text="t('generic.saveChanges')"
          color="primary"
          left-icon="check"
          size="lg"
          @click="handleSave"
      />
    </div>
    <Toast
        v-if="toastData.visible"
        :duration="3000"
        :message="toastData.message"
        :type="toastData.type"
        @close="toastData.visible = false"
        @button-click="toastData.visible = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import PictureUpload from '~/components/Profile/PictureUpload.vue';
import CustomButton from '~/components/CustomButton/CustomButton.vue';
import TextArea from '~/components/inputField/TextArea.vue';
import { HttpMethods } from '#shared/enums/enums';
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const userStore = useUserStore();
if (!userStore.user) {
  userStore
      .refetchCurrentUser()
      .then(() => {
        imgSrc.value =
            userStore.user?.profile_image || '';
        firstName.value =
            userStore.user?.first_name || '';
        lastName.value =
            userStore.user?.last_name || '';
      })
      .catch(() => {
        console.error(
            'Error fetching user data in profile page',
        );
      });
}

const studentStore = useStudentStore();
if (!studentStore.studentProfile) {
  if (!userStore.user) {
    await userStore
        .refetchCurrentUser()
        .then(() => {
          studentStore
              .fetchStudentProfile(
                  userStore.user?.id ||
                  '',
              )
              .then(() => {
                topicDescription.value =
                    studentStore
                        .studentProfile
                        ?.thesis_description ||
                    '';
              })
              .catch(() => {
                console.error(
                    'Error fetching student data in profile page',
                );
              });
        })
        .catch(() => {
          console.error(
              'Error fetching user data in profile page',
          );
        });
  }
  studentStore
      .fetchStudentProfile(userStore.user?.id || '')
      .then(() => {
        topicDescription.value =
            studentStore.studentProfile
                ?.thesis_description || '';
      })
      .catch(() => {
        console.error(
            'Error fetching student data in profile page',
        );
      });
}

const imgSrc = ref<string>(userStore.user?.profile_image || '');
const firstName = ref(userStore.user?.first_name || '');
const lastName = ref(userStore.user?.last_name || '');
const topicDescription = ref(studentStore.studentProfile?.thesis_description || '');
const buttonIsLoading = ref(false);

const toastData = ref({
  visible: false,
  type: 'success',
  message: ''
});

const updateProfileImage = (base64: string) => {
  $fetch('/api/users/' + userStore.user?.id, {
    method: HttpMethods.PATCH,
    body: {
      profile_image: base64,
    },
  }).then(() => {
    userStore.refetchCurrentUser();
    imgSrc.value = base64;
    toastData.value = {
      visible: true,
      type: 'success',
      message: t('profile.imageUpdated'),
    };
  })
      .catch((error) => {
        console.error('Error updating profile image:', error);
        userStore.refetchCurrentUser();
        toastData.value = {
          visible: true,
          type: 'error',
          message: t('profile.errorSavingChanges'),
        };
      })
};

const userHasChanged = computed(() => {
  if (!userStore.user) return false;
  return (
      firstName.value !== userStore.user?.first_name ||
      lastName.value !== userStore.user?.last_name ||
      imgSrc.value !== userStore.user?.profile_image
  )
})

const studentProfileHasChanged = computed(() => {
  if (!studentStore.studentProfile) return false;
  return (topicDescription.value !== studentStore.studentProfile?.thesis_description)
});

const navigateToEditTags = () => {
  navigateTo('/student/edit-tags');
};

const handleSave = async () => {
  if (!userHasChanged.value && !studentProfileHasChanged.value) return;
  buttonIsLoading.value = true;
  if (!userStore.user) {
    await userStore.refetchCurrentUser();
  }
  if (!studentStore.studentProfile) {
    await studentStore.fetchStudentProfile(
        userStore.user?.id || '',
    );
  }

  if (userHasChanged.value) {
    try {
      useFetch(
          '/api/users/' + userStore.user?.id,
          {
            method: HttpMethods.PATCH,
            body: {
              first_name: firstName.value,
              last_name: lastName.value,
              profile_image: imgSrc.value,
            },
          },
      );
      await userStore.refetchCurrentUser();
      firstName.value = userStore.user?.first_name || '';
      lastName.value = userStore.user?.last_name || '';
      imgSrc.value = userStore.user?.profile_image || '';
      toastData.value = {
        visible: true,
        type: 'success',
        message: t('profile.changesSaved'),
      };
    } catch (error) {
      await userStore.refetchCurrentUser();
      console.error('Error updating profile:', error);
      toastData.value = {
        visible: true,
        type: 'error',
        message: t('profile.errorSavingChanges'),
      };
    }
  }
  if (studentProfileHasChanged.value) {
    try {
      useFetch(
          '/api/students/' + studentStore.studentProfile?.id,
          {
            method: HttpMethods.PATCH,
            body: {
              thesis_description: topicDescription.value,
            },
          },
      );
      await studentStore.fetchStudentProfile(
          userStore.user?.id || '',
      );
      topicDescription.value = studentStore.studentProfile?.thesis_description || '';
      toastData.value = {
        visible: true,
        type: 'success',
        message: t('profile.changesSaved'),
      };
    } catch (error) {
      await studentStore.fetchStudentProfile(
          userStore.user?.id || '',
      );
      console.error('Error updating student profile:', error);
      toastData.value = {
        visible: true,
        type: 'error',
        message: t('profile.errorSavingChanges'),
      };
    }
  }
  buttonIsLoading.value = false;
}

if (!userStore.user) {
  await userStore.refetchCurrentUser();
}
const tags = ref<Array<unknown>>([]);
const { data } = useFetch<Array<unknown>>(
    '/api/users/' + userStore.user?.id + '/tags',
    {
      method: HttpMethods.GET,
    },
);
watch(data, () => {
  tags.value = data.value || [];
});

definePageMeta({
  layout: "generic-back-layout",
});
</script>
