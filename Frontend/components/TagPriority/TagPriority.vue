<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import draggable from 'vuedraggable';
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  tags: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([ 'update:tags' ]);

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

const sortedTags = ref([ ...props.tags ]);

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
  <div class="w-fit h-full overflow-y-auto flex flex-col gap-0 m-auto px-4">
    <div class="flex flex-row items-center gap-8">
      <div class="flex flex-col w-1 items-center justify-center h-full">
        <!--ARROW-->
        <span class=" border-x-[8px] border-b-[16px] border-transparent border-b-success"/>
        <span class="size-full bg-success"/>
      </div>
      <!--Title and Desc.-->
      <div class="flex flex-col items-start py-4">
        <h2 class="text-header w-fit">
          {{ t('tagPriority.arrangeByPriority') }}
        </h2>
        <!--<p class="text-body opacity-50 max-w-xs">-->
        <!--  {{ t('multiStepForm.description.priority') }}-->
        <!--</p>-->
      </div>
    </div>

    <div class="flex flex-row m-0 p-0">
      <!--CONTENT-->
      <div class="flex flex-col gap-[30px] items-center z-1 custom-gradient w-1 h-fit py-[7px]">
        <div
            v-for="(i) in sortedTags.length"
            :key="i"
            :class="tagStyles(i-1).bg"
            class="size-7 flex items-center justify-center rounded-full font-bold"
        >
          <FontAwesomeIcon
              v-if="i === 1"
              icon="star"/>

          <p
              v-else
              class="text-x-small">
            {{ i }}
          </p>
        </div>
      </div>
      <draggable
          v-model="sortedTags"
          :animation="250"
          class="flex flex-col h-fit gap-4"
          ghost-class="ghost"
          item-key="element"
          tag="div"
          @end="handelChange"
      >
        <template #item="{ element, index }">
          <div class="flex items-center cursor-pointer">
            <!-- Line -->
            <div
                :class="tagStyles(index).bg"
                class="w-6 h-1 rounded-full tag-line"
            />

            <!-- Pill -->
            <div
                :class="tagStyles(index).border"
                class="flex flex-1 items-center rounded-full overflow-hidden shadow border gap-3 pr-4 bg-base-100 tag-pill"
            >
              <!-- Drag Handel -->
              <div
                  :class="tagStyles(index).bg"
                  class="px-3 py-2 tag-handel"
              >
                <FontAwesomeIcon
                    class="opacity-50"
                    icon="fa-grip-lines"
                />
              </div>

              <!-- Tag Name -->
              <p class="text-body text-nowrap w-full overflow-hidden text-ellipsis">
                {{ element.tag_name || t('tagPriority.unknownTag', { tagNumber: index + 1 }) }}
              </p>

            </div>
          </div>
        </template>
      </draggable>
    </div>

    <div class="flex flex-col w-1 items-center justify-center">
      <!--BALL-->
      <span class="w-full bg-[var(--color-warning)] h-8"/>
      <span class="bg-[var(--color-warning)] rounded-full size-4"/>
    </div>
  </div>
</template>

<style scoped>
.custom-gradient {
  background: linear-gradient(
      to bottom,
      var(--color-success) 0%,
      var(--color-neutral-content) 40%,
      var(--color-neutral-content) 60%,
      var(--color-warning) 100%
  );
}

.ghost {
  opacity: 0.3;
}

.ghost .tag-handel,
.ghost .tag-line {
  background: var(--color-neutral-content);
  border-color: var(--color-neutral-content);
  color: var(--color-base-content);
}

.ghost .tag-pill,
.ghost .tag-handel,
.ghost .tag-line {
  border-color: var(--color-neutral-content);
}


</style>
