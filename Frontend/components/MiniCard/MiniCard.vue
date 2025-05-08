<script setup>
import { computed } from "vue";
import CustomTag from "../CustomTag/CustomTag.vue";

const props = defineProps({
  size: {
    type: String,
    default: "md",
    required: false,
    validator: (value) => ["xs", "sm", "md", "lg", "xl"].includes(value),
  },
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
});

const cardSizeClasses = computed(() => ({
  "w-full sm:w-[32rem]": props.fullWidth,
  "w-72 card-xs": !props.fullWidth && props.size === "xs",
  "w-80 card-sm": !props.fullWidth && props.size === "sm",
  "w-96 card-md": !props.fullWidth && props.size === "md",
  "w-[28rem] card-lg": !props.fullWidth && props.size === "lg",
  "w-[32rem] card-xl": !props.fullWidth && props.size === "xl",
  "card-xs": props.fullWidth && props.size === "xs",
  "card-sm": props.fullWidth && props.size === "sm",
  "card-md": props.fullWidth && props.size === "md",
  "card-lg": props.fullWidth && props.size === "lg",
  "card-xl": props.fullWidth && props.size === "xl",
}));
</script>

<template>
  <div
    class="card card-side bg-base-100 p-2 w-100 h-auto gap-6 shadow-lg"
    :class="cardSizeClasses"
  >
    <figure class="flex-shrink-0 w-24 md:w-32">
      <img
        class="rounded-box w-full h-auto object-cover"
        :src="
          props.image || getPlaceholderImage(props.firstName, props.lastName)
        "
        alt="Profile Picture of {{ props.firstName }} {{ props.lastName }}"
      >
    </figure>
    <div class="card-body min-w-0">
      <h2 class="card-title">
        <p class="font-bold">{{ props.firstName }} {{ props.lastName }}</p>
        <CustomTag
          v-if="props.topText || props.topIcon"
          :text="props.topText"
          :right-icon="props.topIcon"
          variant="clear"
          color="base-content"
          class="font-normal"
          muted
        />
      </h2>

      <div class="flex justify-between items-center gap-2">
        <p class="text-base-content/75 truncate w-4/5">
          {{ props.previewText }}
        </p>
        <div class="flex-shrink-0">
          <CustomTag
            v-if="props.bottomText || props.bottomIcon"
            :text="props.bottomText"
            :right-icon="props.bottomIcon"
            variant="clear"
            color="base-content"
            muted
            class="text-sm"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
