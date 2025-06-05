<script lang="ts" setup>
import { ref } from 'vue';

interface Props {
  headline: string;
  content: string;
  maxLength?: number;
}

const props = withDefaults(defineProps<Props>(), {
  maxLength: 150,
});

const { t } = useI18n();

const isOpen = ref(false);

</script>

<template>
  <div class="w-full">
    <div class="flex flex-col gap-3 items-start">
      <h3 class="text-large">{{ props.headline }}</h3>

      <p
          class="text-body opacity-75"
      >
        {{
          props.content.trim().length > props.maxLength && !isOpen
              ? props.content.trim().substring(0, props.maxLength) + '...'
              : props.content.trim()
        }}
      </p>

      <CustomButton
          v-if="props.content.trim().length > props.maxLength"
          :left-icon="isOpen ? 'eye-slash' : 'eye'"
          :text="isOpen ? t('profile.description.showLess') : t('profile.description.showMore')"
          class="p-0 m-0 opacity-75"
          color="default"
          size="xs"
          variant="ghost"
          @click="isOpen = !isOpen"
      />
    </div>
  </div>
</template>

<style scoped>

</style>