<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  allTags: {
    type: Array,
    default: () => [],
  },
  initialSelected: {
    type: Array,
    default: () => [],
  },
  maxSelection: {
    type: Number,
    default: 10,
  },
  descriptionText: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([ 'update:selectedTags' ]);

const showAll = ref(false);
const initialVisibleTags = 5;

const selectedTags = ref([ ...props.initialSelected ]);

const searchValue = ref('');

const availableTags = computed(() => {
  const query = searchValue.value.trim().toLowerCase();
  return props.allTags.filter(tag => {
    const name = (tag.tag_name as string).toLowerCase();
    return !selectedTags.value.includes(tag) &&
        (query === '' || name.includes(query));
  });
});

const visibleTags = computed(() => {
  return showAll.value
      ? availableTags.value
      : availableTags.value.slice(0, initialVisibleTags);
});

function selectTag(tag) {
  if (
      !selectedTags.value.includes(tag) &&
      selectedTags.value.length < 10
  ) {
    selectedTags.value.push(tag);
    emit('update:selectedTags', selectedTags.value);
  }
}

function removeTag(tag) {
  console.log("Removing tag", tag);
  selectedTags.value = selectedTags.value.filter(
      (t) => t !== tag,
  );
  emit('update:selectedTags', selectedTags.value);
}
</script>

<template>
  <div class="flex size-full flex-col">
    <div class="flex flex-col gap-2 pb-4">
      <p class="text-large">{{ t('tagSelector.title') }}</p>

      <p class="text-x-small opacity-50">
        {{ props.descriptionText }}
      </p>
    </div>

    <InputField
        v-model="searchValue"
        :label="t('tagSelector.label')"
        :placeholder="t('tagSelector.search')"
        class="h-fit"
        clearable
        right-icon="xmark"
    />


    <div
        class="flex flex-wrap gap-2 p-3"
        data-test="selected-tags"
    >
      <p
          v-if="selectedTags.length <= 0"
          class="text-x-small opacity-50 h-7 flex items-center">
        {{ t('tagSelector.placeholder') }}
      </p>
      <custom-tag
          v-for="(tag, index) in selectedTags"
          :key="`selected-${index}`"
          :text="tag.tag_name"
          class="cursor-pointer"
          color="primary"
          deletable
          @click="removeTag(tag)"
      />
    </div>

    <div
        class="w-full flex justify-end border-t border-t-base-300 text-xs-heavy p-2 h-fit"
        data-test="selected-tags-count"
    >
      <p
          :class="{'text-error': selectedTags.length >= props.maxSelection}"
          class="opacity-50">
        {{ selectedTags.length }} / {{ props.maxSelection }}
      </p>
    </div>

    <div
        :class="{'border border-base-300 rounded p-4': showAll, 'opacity-50': selectedTags.length == props.maxSelection}"
        class="flex flex-wrap gap-2 gap-y-2 max-h-[40vh] h-fit overflow-y-auto" data-test="tags">
      <!--    <div-->
      <!--        class="h-full overflow-y-auto self-stretch py-3 inline-flex justify-start items-start gap-3 flex-wrap content-start"-->
      <!--        data-test="tags">-->
      <custom-tag
          v-for="(tag, index) in visibleTags"
          :key="`available-${index}`"
          :text="tag.tag_name"
          class="opacity-75"
          clickable
          color="neutral"
          variant="outline"
          @click="selectTag(tag)"
      />
    </div>

    <div class="flex justify-start mt-4">
      <button
          v-if="availableTags.length > initialVisibleTags"
          class="underline"
          type="button"
          @click="showAll = !showAll"
      >
        {{
          showAll
              ? t('generic.showLess')
              : t('generic.showAll')
        }}
      </button>
    </div>
  </div>
</template>
