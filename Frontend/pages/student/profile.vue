<template>
  <div class="w-full h-screen flex flex-col justify-center items-center">
    <AdminHeader
        :header-text="t('profile.pageHeader')"
        right-button="Preview"
        right-icon="eye"
        @right-button-click="navigateToPreview"
    />
    <div
        class="w-full h-full overflow-y-auto p-6 flex flex-col gap-4"
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

      <div
          class="w-full flex justify-center flex-col p-4 gap-3"
      >
        <fieldset class="fieldset w-full">
          <legend
              class="fieldset-legend text-sm font-semibold mb-1 opacity-50 my-0 py-1"
          >
            First Name
          </legend>
          <input
              v-model="firstName"
              class="input w-full"
              placeholder="First Name"
              type="text"
          >
        </fieldset>
        <fieldset class="fieldset w-full">
          <legend
              class="fieldset-legend text-sm font-semibold mb-1 opacity-50 my-0 py-1"
          >
            Last Name
          </legend>
          <input
              v-model="lastName"
              class="input w-full"
              placeholder="Last Name"
              type="text"
          >
        </fieldset>
      </div>
      <hr class="border-base-300 text-base-300">

      <!--        TODO:MAKE TAGS EDITABLE-->
      <div
          class="w-full flex justify-center flex-col p-4 gap-3"
      >
        <div
            class="w-full flex flex-row flex-wrap gap-2 justify-center"
        >
          <CustomTag
              v-for="tag in tags"
              :key="tag.tag.tag_id"
              :text="tag.tag.tag_name"
              @delete="
							removeTag(
								tag.tag.tag_id,
							)
						"
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
          :maxlength="1000"
          :rows="8"
          class="w-full"
          label-bottom="Your topic description will be visible to other users"
          label-top="Topic Description"
          name="topic-description"
          placeholder="Tell us about your thesis idea..."
      />

      <hr class="border-base-300 text-base-300">
    </div>
    <div
        class="w-full flex justify-center p-4 border-t border-t-base-300 shadow"
    >
      <CustomButton
          :text="t('generic.saveChanges')"
          color="primary"
          left-icon="check"
          size="lg"
          @click="handleSave"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import PictureUpload from '~/components/Profile/PictureUpload.vue';
import CustomButton from '~/components/CustomButton/CustomButton.vue';
import type { tagData } from '#shared/types/tagInterfaces';
import TextArea from '~/components/inputField/TextArea.vue';
import { HttpMethods } from '#shared/enums/enums';

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
const topicDescription = ref(
    studentStore.studentProfile?.thesis_description || '',
);
const buttonIsLoading = ref(false);

const updateProfileImage = (base64: string) => {
  $fetch('/api/users/' + userStore.user?.id, {
    method: HttpMethods.PATCH,
    body: {
      profile_image: base64,
    },
  }).finally(() => {
    userStore.refetchCurrentUser();
  });
  imgSrc.value = base64;
};

// TODO: implement the logic to navigate to edit tags and edit them
const navigateToEditTags = () => {
  console.log('Navigate to edit tags');
};

const handleSave = async () => {
  if (!userStore.user) {
    await userStore.refetchCurrentUser();
  }
  if (!studentStore.studentProfile) {
    await studentStore.fetchStudentProfile(
        userStore.user?.id || '',
    );
  }

  if (
      firstName.value !== userStore.user?.first_name ||
      lastName.value !== userStore.user?.last_name ||
      imgSrc.value !== userStore.user?.profile_image
  ) {
    const { status } = useFetch(
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
    watch(status, async (status) => {
      buttonIsLoading.value = status === 'pending';
    });
  }
  if (
      topicDescription.value !==
      studentStore.studentProfile?.thesis_description
  ) {
    const { status } = useFetch(
        '/api/students/' +
        studentStore.studentProfile?.id,
        {
          method: HttpMethods.PATCH,
          body: {
            thesis_description:
            topicDescription.value,
          },
        },
    );
    await studentStore.fetchStudentProfile(
        userStore.user?.id || '',
    );
    watch(status, async (status) => {
      buttonIsLoading.value = status === 'pending';
    });
  }
};

const navigateToPreview = () => {
  // Navigate to the profile preview page
  // TODO: implement the logic, this is only a placeholder
  // router.push('/profile-preview');
};

// TODO: IMPLEMENT THIS
const removeTag = (tag: tagData) => {
  console.log('Removing tag:', tag);
  // tags.value = tags.value.filter(t => t.id !== tag.id);
};

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
</script>
