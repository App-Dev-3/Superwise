<script setup>
import {onMounted, ref} from 'vue';
import draggable from 'vuedraggable';
import {useI18n} from 'vue-i18n';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

const {t} = useI18n();

const props = defineProps({
  tags: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:tags']);

function tagStyles(index) {
  return {
    ...(index === 0 && {
      bg: 'bg-success text-success-content',
      border: 'border-success',
    }),
    ...(index === sortedTags.value.length - 1 && {
      bg: 'bg-[var(--color-warning)] text-[var(--color-warning-content)]',
      border: 'border-[var(--color-warning)]',
    }),
    ...(index !== 0 &&
        index !== sortedTags.value.length - 1 && {
          bg: 'bg-neutral-content text-base-content',
          border: 'border-neutral-content',
        }),
  };
}

const sortedTags = ref([...props.tags]);

onMounted(() => {
  handelChange();
});

function handelChange() {
  const prioritized = sortedTags.value.map((tag, index) => ({
    tag_id: tag.id,
    priority: index + 1, // Priority starts at 1
  }));
  emit('update:tags', prioritized);
}
</script>

<template>
  <div class="flex flex-row size-full">
    <div class="h-full w-0 flex flex-col">
      <!--TODO: fix this to look better & go with size-->
      <svg class="h-full" fill="none" viewBox="0 0 12 674" width="12" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M6 0L0.226497 10H11.7735L6 0ZM0.666667 668C0.666667 670.946 3.05448 673.333 6 673.333C8.94552 673.333 11.3333 670.946 11.3333 668C11.3333 665.055 8.94552 662.667 6 662.667C3.05448 662.667 0.666667 665.055 0.666667 668ZM6 9H5V668H6H7V9H6Z"
            fill="url(#paint0_linear_7269_5271)"/>
        <defs>
          <linearGradient id="paint0_linear_7269_5271" gradientUnits="userSpaceOnUse" x1="6.5" x2="6.5" y1="0" y2="668">
            <stop stop-color="#00D390"/>
            <stop offset="0.4" stop-color="#E4E4E7"/>
            <stop offset="0.6" stop-color="#EEEEEE"/>
            <stop offset="1" stop-color="#FCB700"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div class="py-4 flex flex-col h-full gap-4">
      <h2 class="text-header">
        {{ t('tagPriority.arrangeByPriority') }}
      </h2>
      <draggable
          v-model="sortedTags"
          :animation="250"
          ghost-class="ghost"
          item-key="element"
          tag="div"
          @end="handelChange"
      >
        <template #item="{ element, index }">
          <div class="flex items-center mb-3 cursor-pointer">
            <div
                :class="tagStyles(index).bg"
                class="size-7 flex items-center justify-center rounded-full font-bold"
            >
              <FontAwesomeIcon
                  v-if="index === 0"
                  icon="star"/>

              <p
                  v-else
                  class="text-x-small">
                {{ index + 1 }}
              </p>
            </div>

            <div
                :class="tagStyles(index).bg"
                class="w-2 h-1"/>

            <div
                :class="tagStyles(index).border"
                class="flex flex-1 items-center rounded-full overflow-hidden shadow border"
            >
              <div
                  :class="tagStyles(index).bg"
                  class="px-3 py-2 font-bold"
              >
                <FontAwesomeIcon
                    class="opacity-50"
                    icon="fa-grip-lines"
                />
              </div>

              <div
                  class="flex-1 px-4 py-2 text-sm font-medium text-center"
              >
                <p class="text-body">
                  {{ element.tag_name || t('tagPriority.unknownTag', {tagNumber: index}) }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<style scoped>
</style>
