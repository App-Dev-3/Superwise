<script setup>
import { computed } from "vue";
import CustomTag from "../CustomTag/CustomTag.vue";

const props = defineProps({
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
  },
  topText: {
    type: String,
    required: false,
  },
  bottomIcon: {
    type: String,
    required: false,
  },
  bottomText: {
    type: String,
    required: false,
  },
});
</script>

<template>
  <div class="card bg-base-100 shadow-lg">
    <div class="card-body">
      <h2 class="card-title font-bold">
        <div class="mask mask-squircle">
          <img
            class="rounded-box"
            :src="
              props.image ||
              getPlaceholderImage(props.firstName, props.lastName)
            "
            alt="Profile Picture of {{ props.firstName }} {{ props.lastName }}"
          />
        </div>
        {{ props.firstName }} {{ props.lastName }}
      </h2>

      <p class="text-base-content/75 leading-tight">
        {{ previewText }}
      </p>
    </div>
  </div>
</template>

<style scoped></style>
