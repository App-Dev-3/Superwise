<script setup>
	import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
	import { useI18n } from 'vue-i18n';

	const { t } = useI18n();

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
			class="step text-base-content font-bold"
			:class="{
				'step-primary': props.step >= 1,
				'text-sm': props.smallText,
			}"
		>
			<span class="step-icon">
				<FontAwesomeIcon
					icon="arrow-right-to-bracket"
				/>
			</span>
			{{ $t('statusBar.onboarding') }}
		</li>
		<li
			class="step text-base-content font-bold"
			:class="{
				'step-primary': props.step >= 2,
				'text-sm': props.smallText,
			}"
		>
			<span class="step-icon">
				<FontAwesomeIcon icon="message" />
			</span>
			{{ $t('statusBar.matching') }}
		</li>
		<li
			class="step text-base-content font-bold"
			:class="{
				'step-primary': props.step === 3,
				'text-sm': props.smallText,
			}"
		>
			<span class="step-icon">
				<FontAwesomeIcon icon="user-group" />
			</span>
			{{ $t('statusBar.confirmed') }}
		</li>
	</ul>
</template>
