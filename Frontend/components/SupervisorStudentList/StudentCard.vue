<script lang="ts" setup>
import {computed} from 'vue';
import Avatar from '../Avatar/Avatar.vue';
import CustomButton from '../CustomButton/CustomButton.vue';

interface StudentCardProps {
  editMode: boolean;
  firstName: string;
  lastName: string;
  email: string;
  src?: string;
}

const props = withDefaults(defineProps<StudentCardProps>(), {
  src: "",
});

const editStyle = computed(() => {
  return props.editMode ? "border-b-1 border-b-error" : "";
});

const emit = defineEmits(["click"])
</script>

<template>
  <div
      :class="editStyle"
      class="flex flex-row gap-3 p-2 items-center">
    <Avatar
        :first-name="props.firstName"
        :last-name="props.lastName"
        :src="props.src"
        alt="Profile Picture of {{ props.firstName }} {{ props.lastName }}"
        shape="circle"
        size="sm"/>

    <div class="flex flex-col w-full">
      <span class="text-body">{{ props.firstName }} {{ props.lastName }}</span>
      <span class="text-x-small">{{ props.email }}</span>
    </div>

    <CustomButton
        v-if="editMode"
        color="error"
        left-icon="remove"
        size="xs"
        text=""
        variant="ghost"
        @click="emit('click')"
    />
  </div>

</template>

<style scoped>

</style>
