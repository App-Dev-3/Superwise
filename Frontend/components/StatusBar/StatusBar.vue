<script setup>
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {useI18n} from 'vue-i18n';

const {t} = useI18n();

const props = defineProps({
  step: {
    type: Number,
    default: 1,
  },
  smallText: {
    type: Boolean,
    default: true,
  },
});
</script>

<template>
  <ul class="steps w-full">
    <li
        :class="{
				'step-primary': props.step >= 1,
				'text-sm': props.smallText,
			}"
        class="step text-base-content font-bold"
    >
			<span class="step-icon">
				<FontAwesomeIcon
            :icon="props.step < 1 ? 'arrow-right-to-bracket': 'check'"
        />
			</span>
      {{ t('statusBar.onboarding') }}
    </li>
    <li
        :class="{
				'step-primary': props.step >= 2,
				'text-sm': props.smallText,
			}"
        class="step text-base-content font-bold"
    >
			<span class="step-icon">
				<FontAwesomeIcon
            :icon="props.step < 2 ? 'message' : 'check'"
        />
			</span>
      {{ t('statusBar.matching') }}
    </li>
    <li
        :class="{
				'step-primary': props.step === 3,
				'text-sm': props.smallText,
			}"
        class="step text-base-content font-bold"
    >
			<span class="step-icon">
				<FontAwesomeIcon
            :icon="props.step < 3 ? 'user-group':'check'"/>
			</span>
      {{ t('statusBar.confirmed') }}
    </li>
  </ul>
</template>
