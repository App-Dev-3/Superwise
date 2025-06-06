<script setup>
import {computed} from 'vue';
import CustomTag from '../CustomTag/CustomTag.vue';

const {t} = useI18n();

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    required: false,
    validator: (value) =>
        ['xs', 'sm', 'md', 'lg', 'xl'].includes(value),
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
  tags: {
    type: Array,
    default: () => [],
  },
  maxTagAmount: {
    type: Number,
    default: 4,
  },
  description: {
    type: String,
    default: '',
  },
  similarityScore: {
    type: Number,
    required: true,
  },
  maxCapacity: {
    type: Number,
    required: true,
  },
  currentCapacity: {
    type: Number,
    required: true,
  },
  pendingAmount: {
    type: Number,
    default: 0,
  },
});

const limitedTags = computed(() =>
    props.tags.slice(0, props.maxTagAmount),
);

const cardSizeClasses = computed(() => ({
  'w-full sm:w-[32rem]': props.fullWidth,
  'w-72 card-xs': !props.fullWidth && props.size === 'xs',
  'w-80 card-sm': !props.fullWidth && props.size === 'sm',
  'w-96 card-md': !props.fullWidth && props.size === 'md',
  'w-[28rem] card-lg': !props.fullWidth && props.size === 'lg',
  'w-[32rem] card-xl': !props.fullWidth && props.size === 'xl',
  'card-xs': props.fullWidth && props.size === 'xs',
  'card-sm': props.fullWidth && props.size === 'sm',
  'card-md': props.fullWidth && props.size === 'md',
  'card-lg': props.fullWidth && props.size === 'lg',
  'card-xl': props.fullWidth && props.size === 'xl',
}));

const imageSizeClasses = computed(() => ({
  'size-8': props.size === 'xs',
  'size-10': props.size === 'sm',
  'size-12': props.size === 'md',
  'size-14': props.size === 'lg',
  'size-16': props.size === 'xl',
}));

// Regular tag size based on card size
const regularTagSize = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'sm';
    case 'sm':
      return 'md';
    case 'md':
      return 'md';
    case 'lg':
      return 'lg';
    case 'xl':
      return 'xl';
    default:
      return 'md';
  }
});

// Metric tag size (for similarity score, capacity, pending)
const metricTagSize = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'xs';
    case 'sm':
      return 'sm';
    case 'md':
      return 'sm';
    case 'lg':
      return 'md';
    case 'xl':
      return 'md';
    default:
      return 'sm';
  }
});

const emptyDescription = computed(
    () => !props.description.trim().length,
);
const descriptionClasses = computed(() => ({
  'text-xs line-clamp-4':
      props.size === 'xs' ||
      props.size === 'sm' ||
      props.size === 'md',
  'text-md line-clamp-4':
      props.size === 'lg' || props.size === 'xl',
  'h-0': emptyDescription,
  'h-15':
      (props.size === 'xs' ||
          props.size === 'sm' ||
          props.size === 'md') &&
      !emptyDescription.value,
  'h-20': props.size === 'lg' && !emptyDescription.value,
  'h-22': props.size === 'xl' && !emptyDescription.value,
}));
</script>

<template>
  <div
      :class="cardSizeClasses" class="card bg-base-100 shadow-lg border border-base-300">
    <div class="card-body">
      <h2 class="card-title font-bold">
        <div class="mask mask-squircle">
          <img
              :alt="
							t(
								'supervisorCard.profilePictureAlt',
								{
									firstName: props.firstName,
									lastName: props.lastName,
								},
							)
						"
              :class="imageSizeClasses"
              :src="
							props.image ||
							getPlaceholderImage(
								props.firstName,
								props.lastName,
							)
						"
              class="rounded-box"
          >
        </div>
        {{ props.firstName }} {{ props.lastName }}
      </h2>

      <p
          :class="descriptionClasses"
          class="text-base-content/75 leading-tight"
      >
        {{ description.trim() }}
      </p>
      <div>
        <CustomTag
            v-for="tag in limitedTags"
            :key="tag"
            :size="regularTagSize"
            :text="tag"
            variant="outline"
        />
      </div>
      <div class="card-actions w-full flex justify-between">
        <CustomTag
            :size="metricTagSize"
            :text="props.similarityScore + '%'"
            :title="
						t(
							'supervisorCard.similarityScore',
						)
					"
            color="base-content"
            muted
            variant="clear"
        />
        <div>
          <CustomTag
              :size="metricTagSize"
              :text="
							props.currentCapacity +
							'/' +
							props.maxCapacity +
							' '
						"
              :title="
							t(
								'supervisorCard.capacity',
							)
						"
              color="base-content"
              muted
              right-icon="user-group"
              variant="clear"
          />
          <CustomTag
              :size="metricTagSize"
              :text="
							props.pendingAmount +
							' '
						"
              :title="
							t(
								'supervisorCard.pending',
							)
						"
              color="base-content"
              muted
              right-icon="hourglass"
              variant="clear"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
