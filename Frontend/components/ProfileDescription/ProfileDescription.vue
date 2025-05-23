<script setup lang="ts">
	import { useMediaQuery } from '@vueuse/core';
	import { computed, ref } from 'vue';
	import { useI18n } from 'vue-i18n';

	const { t } = useI18n();

	interface Props {
		headline: string;
		content: string;
	}

	const props = defineProps<Props>();

	const isOpen = ref(false);

	const isLargeScreen = useMediaQuery('(min-width: 1024px)');
	const isMediumScreen = useMediaQuery(
		'(min-width: 768px) and (max-width: 1023px)',
	);
	const isSmallScreen = useMediaQuery(
		'(max-width: 767px) and (min-width: 640px)',
	);
	const isExtraSmallScreen = useMediaQuery('(max-width: 639px)');

	const buttonNeeded: boolean = computed(() => {
		return (
			(props.content.trim().length > 100 &&
				isExtraSmallScreen.value) ||
			(props.content.trim().length > 160 &&
				isSmallScreen.value) ||
			(props.content.trim().length > 450 &&
				isMediumScreen.value) ||
			(props.content.trim().length > 600 &&
				isLargeScreen.value)
		);
	});
</script>

<template>
	<div class="lg:w-full">
		<div class="px-4">
			<h3 class="text-left text-xl">{{ props.headline }}</h3>
			<p
				class="text-base-content leading-snug text-md"
				:class="{ 'line-clamp-4': !isOpen }"
			>
				{{ content.trim() }}
			</p>
		</div>

		<div v-if="buttonNeeded" class="flex justify-start">
			<CustomButton
				color="neutral"
				:text="isOpen ? 'Show less' : 'Show more'"
				:left-icon="isOpen ? 'eye-slash' : 'eye'"
				size="xs"
				variant="ghost"
				@click="isOpen = !isOpen"
			/>
		</div>
	</div>
</template>

<style scoped></style>
