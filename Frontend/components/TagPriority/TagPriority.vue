<script setup>
import { computed, ref, watch } from 'vue'
import draggable from 'vuedraggable'

const props = defineProps({
  tags: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:tags'])
function textColor(index) {
  return {
    'text-green-500': index === 0,
    'text-orange-500': index === sortedTags.value.length - 1,
    'text-gray-500': index !== 0 && index !== sortedTags.value.length - 1
  }
}

function backgroundColor(index) {
  return {
    'bg-green-500': index === 0,
    'bg-orange-500': index === sortedTags.length - 1,
    'bg-gray-400': index !== 0 && index !== sortedTags.length - 1
  }
}

const sortedTags = ref([...props.tags])

watch(() => props.tags, (newTags) => {
  sortedTags.value = [...newTags]
})

function onEnd() {
  emit('update:tags', sortedTags.value)
}
</script>

<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Arrange tags by priority</h2>

    <draggable
      v-model="sortedTags"
      item-key="element"
      @end="onEnd"
      :animation="200"
      ghost-class="ghost"
      tag="div"
    >
      <template #item="{ element, index }">
        <div
          class="flex items-center mb-3"
        >
          <div
            class="w-6 text-sm font-semibold text-center"
            :class="textColor(index)"
          >
            {{ index + 1 }}
          </div>

          <div
            class="flex flex-1 items-center rounded-full overflow-hidden shadow border"
            :class="textColor(index)"
          >
            <div
              class="px-3 py-2 text-white font-bold"
              :class="backgroundColor(index)"
            >
              =
            </div>

            <!-- Tag name -->
            <div class="flex-1 px-4 py-2 text-sm font-medium text-center">
              {{ element }}
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
