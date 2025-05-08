<script setup>
import { ref } from 'vue'
import draggable from 'vuedraggable'

const props = defineProps({
  tags: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:tags'])

function tagStyles(index) {
  return {
    ...(index === 0 && {
      bg: 'bg-green-500',
      text: 'text-white',
      border: 'border-green-500'
    }),
    ...(index === sortedTags.value.length - 1 && {
      bg: 'bg-orange-500',
      text: 'text-white',
      border: 'border-orange-500'
    }),
    ...((index !== 0 && index !== sortedTags.value.length - 1) && {
      bg: 'bg-gray-400',
      text: 'text-black',
      border: 'border-gray-400'
    })
  }
}


const sortedTags = ref([...props.tags])

function handelChange() {
  const prioritized = sortedTags.value.map((tag, index) => ({
    tag_id: tag.id, 
    priority: index + 1    // Priority starts at 1
  }))
  emit('update:tags', prioritized)
}
</script>

<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Arrange tags by priority</h2>
    <draggable
      v-model="sortedTags"
      item-key="element"
      :animation="250"
      ghost-class="ghost"
      tag="div"
      @end="handelChange"
    >
      <template #item="{ element, index }">
        <div
          class="flex items-center mb-3"
        >
          <div
            class="w-6 text-black-500 text-sm font-semibold text-center rounded-full mr-2"
            :class="tagStyles(index).bg"
            >
            {{ index + 1 }}
          </div>

          <div
            class="flex flex-1 items-center rounded-full overflow-hidden shadow border"
            :class="tagStyles(index).border"
          >
            <div
              class="px-3 py-2 text-white font-bold"
              :class="tagStyles(index).bg"
            >
              =
            </div>

            <div class="flex-1 px-4 py-2 text-sm font-medium text-center">
              {{ element.tag_name }}
            </div>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
  background-color: #c8ebfb;
}
</style>
