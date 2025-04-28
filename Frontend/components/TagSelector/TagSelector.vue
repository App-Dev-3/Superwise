<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  allTags: {
    type: Array,
    default: () => []
  },
  initialSelected: {
    type: Array,
    default: () => []
  },
  maxSelection: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['update:selectedTags'])

const showAll = ref(false)
const maxVisibleTags = 5

const selectedTags = ref([...props.initialSelected])

const availableTags = computed(() => {
  return props.allTags.filter(tag => !selectedTags.value.includes(tag))
})

const visibleTags = computed(() => {
  return showAll.value ? availableTags.value : availableTags.value.slice(0, maxVisibleTags)
})

function selectTag(tag) {
  if (!selectedTags.value.includes(tag) && selectedTags.value.length < 10) {
    selectedTags.value.push(tag)
    emit('update:selectedTags', selectedTags.value)
  }
}

function removeTag(tag) {
  selectedTags.value = selectedTags.value.filter(t => t !== tag)
  emit('update:selectedTags', selectedTags.value)
}
</script>

<template>
  <div class="p-4">

    <div 
      class="border-b border-base-300 pb-4 mb-4 relative"
      
      >
      <div 
        class="flex flex-wrap gap-2 pr-10"
        data-test="selected-tags"
      >
        <custom-tag
          v-for="(tag, index) in selectedTags"
          :key="`selected-${index}`"
          :text="tag"
          color="success"
          deletable
          @delete="removeTag(tag)"
        />
      </div>

      <div 
        class="absolute right-2 bottom-1 text-sm"
        :class="{
          'text-red-500': selectedTags.length >= props.maxSelection,
          'text-gray-400': selectedTags.length < props.maxSelection
        }"
        data-test="selected-tags-count"
      >
        {{ selectedTags.length }}/10
      </div>
    </div>

    <div 
      class="flex flex-wrap gap-2 pr-10;"
      data-test="tags"

      >
      <custom-tag
        v-for="(tag, index) in visibleTags"
        :key="`available-${index}`"
        :text="tag"
        color="secondary"
        clickable
        @click="selectTag(tag)"
      />
    </div>

    <div class="flex justify-start mt-4">
      <button 
        v-if="availableTags.length > maxVisibleTags"
        type="button"
        class="text-primary underline" 
        @click="showAll = !showAll">
        {{ showAll ? 'Show less' : 'Show all' }}
      </button>
    </div>

  </div>
</template>
