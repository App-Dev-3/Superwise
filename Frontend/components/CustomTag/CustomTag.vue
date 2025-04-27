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
  deletable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click', 'delete'])

function handleClick() {
  if (props.clickable && !props.deletable) {
    emit('click')
  }
}

function handleDelete() {
  if (props.deletable) {
    emit('delete')
  }
}
</script>

<template>
  <div 
    class="badge badge-neutral badge-outline p-1"
    :class="[
      `bg-${color}`, 
      `text-${color}-content`,
      {
        'cursor-pointer' : clickable,
      }
    ]"
    @click="handleClick"
  >
    <FontAwesomeIcon
      v-if="deletable"
      icon="xmark"
      class="text-s cursor-pointer"
      data-test="icon"
      @click="handleDelete"
    />
      {{ name }}
  </div>

</template>