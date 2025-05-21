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
          emoji="⚙️"
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
import {useRouter} from 'vue-router';

const router = useRouter();
const imgSrc = ref('https://example.com/avatar.jpg');


const handleFileUploaded = (base64: string) => {
  imgSrc.value = base64;
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
      bio: topicDescription.value,
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
const firstName = ref('Felix');
const lastName = ref('Teutsch');</script>
