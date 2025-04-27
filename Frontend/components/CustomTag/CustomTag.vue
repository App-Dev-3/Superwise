<script setup>
const props = defineProps({
  name: {
    type: String,
    default: 'Tag',
  },
  color: {
    type: String,
    default: 'primary',
  },
  clickable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

function handleClick() {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<template>
  <div 
    class="badge badge-neutral badge-outline p-1"
    :class="[
      `bg-${color}`, 
      `text-${color}-content`, 
    ]"
  >
    <FontAwesomeIcon
      v-if="clickable"
      icon="xmark"
      class="text-s cursor-pointer"
      @click="handleClick"
      data-test="icon"
    />
      {{ name }}
  </div>

</template>