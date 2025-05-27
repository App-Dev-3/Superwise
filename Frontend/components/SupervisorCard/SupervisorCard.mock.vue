<script lang="ts" setup>
import CustomTag from '../CustomTag/CustomTag.vue';

// Mock version with no i18n dependencies for testing
const props = defineProps({
  image: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  description: { type: String, default: '' },
  tags: { type: Array, default: () => [] },
  similarityScore: { type: Number, default: 0 },
  maxCapacity: { type: Number, default: 0 },
  currentCapacity: { type: Number, default: 0 },
  pendingAmount: { type: Number, default: 0 },
  maxTagAmount: { type: Number, default: 10 },
});
</script>

<template>
  <div class="supervisor-card">
    <div class="card-header">
      <img :src="props.image">
      <h3>{{ props.firstName }} {{ props.lastName }}</h3>
    </div>

    <div v-if="props.description" class="props.description">{{ props.description }}</div>

    <div class="props.tags-container">
      <CustomTag v-for="(tag, index) in props.tags.slice(0, maxTagAmount)" :key="index" :text="tag"/>
      <CustomTag :text="`${props.similarityScore}%`" color="success"/>
      <CustomTag :text="`${currentCapacity}/${props.maxCapacity} `" right-icon="user-group"/>
      <CustomTag :text="`${pendingAmount} `" color="warning" right-icon="hourglass"/>
    </div>
  </div>
</template>
