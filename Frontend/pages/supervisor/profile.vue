<template>
  <div class="w-full h-screen flex flex-col justify-center items-center">
    <AdminHeader
      :header-text="$t('profile.pageHeader')"
      right-button="Preview"
      right-icon="eye"
      @right-button-click="navigateToPreview"
    />
    <div class="w-full h-full overflow-y-auto p-6 flex flex-col gap-4">
      <div class="w-full flex justify-center py-16 px-8">
        <PictureUpload
          :first-name="firstName"
          :img-src="imgSrc"
          :last-name="lastName"
          emoji="🧑‍🏫"
          ring-color="info"
          size="xl"
          @file-uploaded="handleFileUploaded"
        />
      </div>

      <hr class="border-base-300 text-base-300">

      <div class="w-full flex justify-center flex-col p-4 gap-3">
        <InputField
          :model-value="firstName"
          class="w-full"
          label="First Name"
          name="first-name"
          placeholder="First Name"
        />
        <InputField
          :model-value="lastName"
          class="w-full"
          label="Last Name"
          name="last-name"
          placeholder="Last Name"
        />
      </div>

      <hr class="border-base-300 text-base-300">

      <div class="w-full flex justify-center flex-col p-4 gap-3">
        <div
          class="w-full flex flex-row flex-wrap gap-2 justify-center">
          <CustomTag
            v-for="(tag, index) in tags"
            :key="`selected-${index}`"
            :text="tag.tag_name"
            @delete="removeTag(tag)"
          />
        </div>
        <CustomButton
          :text="$t('generic.edit')"
          color="default"
          left-icon="edit"
          size="xs"
          variant="ghost"
          @click="navigateToEditTags"
        />
      </div>

      <hr class="border-base-300 text-base-300">

      <TextArea
        v-model="bio"
        :maxlength="1000"
        :rows="8"
        class="w-full"
        label-bottom="Your bio will be visible to other users"
        label-top="Bio"
        name="bio"
        placeholder="Tell us about yourself..."
      />

      <hr class="border-base-300 text-base-300">

      <div class="w-full flex justify-center">
        <CustomButton
          :text="$t('generic.saveChanges')"
          color="primary"
          left-icon="check"
          size="lg"
          @click="handleSave"
        />
      </div>

    </div>
  </div>
</template>


<script lang="ts" setup>
import {ref} from 'vue';
import PictureUpload from "~/components/Profile/PictureUpload.vue";
import CustomButton from "~/components/CustomButton/CustomButton.vue";
import type {tagData} from "#shared/types/tagInterfaces";
import TextArea from "~/components/inputField/TextArea.vue";
import {useRouter} from 'vue-router';

const router = useRouter();
const imgSrc = ref('https://example.com/avatar.jpg');


const handleFileUploaded = (base64: string) => {
  imgSrc.value = base64;
};

const navigateToEditTags = () => {
  router.push('/edit-tags');
};

const handleSave = async () => {
  try {
    // TODO: Implement API call to save profile data
    // 1. Validate form data
    // 2. Prepare data object with user information
    // 3. Call API to update user profile
    // 4. Handle success (show notification, etc.)
    console.log('Saving profile data:', {
      firstName: firstName.value,
      lastName: lastName.value,
      bio: bio.value,
      tags: tags.value,
      imgSrc: imgSrc.value
    });

    // Show success message or redirect
  } catch (error) {
    // Handle error (show error message, etc.)
    console.error('Error saving profile:', error);
  }
};

const navigateToPreview = () => {
  // Navigate to the profile preview page
  // TODO: implement the logic, this is only a placeholder
  router.push('/profile-preview');
};

const removeTag = (tag: tagData) => {
  tags.value = tags.value.filter(t => t.id !== tag.id);
};

const tags = ref([
  {tag_name: 'AI', id: 1},
  {tag_name: 'HCI', id: 2},
  {tag_name: 'COMPUTER', id: 3},
  {tag_name: 'MATH', id: 4},
  {tag_name: 'Health Care', id: 5}
] as tagData[]);
const firstName = ref('Felix');
const lastName = ref('Teutsch');
const bio = ref('My name is Markus Seidl and I am the head of the FH St. Pölten. I rule over all, and my commands must be followed! When I tell people to do things, they do things. When i...');
</script>
