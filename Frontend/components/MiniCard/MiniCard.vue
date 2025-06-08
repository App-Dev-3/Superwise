<script setup>
import CustomTag from "../CustomTag/CustomTag.vue";

const props = defineProps({
  fullWidth: {
    type: Boolean,
    default: false,
    required: false,
  },
  image: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  previewText: {
    type: String,
    required: true,
  },
  topIcon: {
    type: String,
    required: false,
    default: "",
  },
  topText: {
    type: String,
    required: false,
    default: "",
  },
  bottomIcon: {
    type: String,
    required: false,
    default: "",
  },
  bottomText: {
    type: String,
    required: false,
    default: "",
  },
  showDelete: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['cardClicked', 'deleteClicked']);

</script>

<template>
  <div
      class="flex flex-row gap-3 p-2 w-full bg-base-100 "
  >
    <div 
      @click="emit('cardClicked')"
      class="flex flex-row gap-3 items-center w-full cursor-pointer rounded-3xl"
      :class="{'w-full': props.fullWidth, 'w-fit': !props.fullWidth}"
    >
      <div class="avatar">
        <div class="mask mask-squircle w-16">
          <img
              :src="props.image || getPlaceholderImage(props.firstName, props.lastName)"
              alt="Profile Picture of {{ props.firstName }} {{ props.lastName }}"
          >
        </div>
      </div>
      <div class="flex flex-col flex-auto min-w-0 h-fit">
        <div class="flex justify-between">
          <div class="text-large capitalize">{{ props.firstName }} {{ props.lastName }}</div>
          <div class="opacity-75">
            <CustomTag
                v-if="props.topText || props.topIcon"
                :right-icon="props.topIcon"
                :text="props.topText"
                class="font-normal"
                color="base-content"
                muted
                variant="clear"
            />
          </div>
        </div>

        <div class="flex justify-between items-center gap-2 opacity-50">
          <div class="text-small text-base-content/75 truncate w-4/5">
            {{ props.previewText }}
          </div>
          <div class="flex-shrink-0">
            <CustomTag
                v-if="props.bottomText || props.bottomIcon"
                :right-icon="props.bottomIcon"
                :text="props.bottomText"
                class="text-sm"
                color="base-content"
                muted
                variant="clear"
            />
          </div>
        </div>
      </div>
    </div>
    <button
      v-if="props.showDelete"
      @click="emit('deleteClicked')"
      class="ml-2 text-error hover:text-error-content transition-colors"
      title="Withdraw Request"
    >
      <FontAwesomeIcon icon="trash-can"/>
    </button>
  </div>
</template>

<style scoped></style>