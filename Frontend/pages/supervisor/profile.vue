<template>
	<div class="w-full h-screen flex flex-col justify-center items-center">
		<AdminHeader
			:header-text="$t('profile.pageHeader')"
			:right-button="$t('profile.preview')"
			right-icon="eye"
			@right-button-click="navigateToPreview"
		/>
		<div
			class="w-full h-full overflow-y-auto p-6 flex flex-col gap-4"
		>
			<div class="w-full flex justify-center py-16 px-8">
				<PictureUpload
					:first-name="firstName"
					:img-src="imgSrc"
					:last-name="lastName"
					emoji="🧑‍🏫"
					ring-color="info"
					size="xl"
					@file-uploaded="updateProfileImage"
				/>
			</div>

			<hr class="border-base-300 text-base-300" />

			<div
				class="w-full flex justify-center flex-col p-4 gap-3"
			>
				<fieldset class="fieldset w-full">
					<legend
						class="fieldset-legend text-sm font-semibold mb-1 opacity-50 my-0 py-1"
					>
						{{ $t('profile.firstName') }}
					</legend>
					<input
						v-model="firstName"
						type="text"
						class="input w-full"
						:placeholder="
							$t('profile.firstName')
						"
					/>
				</fieldset>
				<fieldset class="fieldset w-full">
					<legend
						class="fieldset-legend text-sm font-semibold mb-1 opacity-50 my-0 py-1"
					>
						{{ $t('profile.lastName') }}
					</legend>
					<input
						v-model="lastName"
						type="text"
						class="input w-full"
						:placeholder="
							$t('profile.lastName')
						"
					/>
				</fieldset>
			</div>

			<hr class="border-base-300 text-base-300" />

			<div
				class="w-full flex justify-center flex-col p-4 gap-3"
			>
				<div
					class="w-full flex flex-row flex-wrap gap-2 justify-center"
				>
					<CustomTag
						v-for="tag in tags"
						:key="tag.tag.tag_id"
						:text="tag.tag.tag_name"
						@delete="
							removeTag(
								tag.tag.tag_id,
							)
						"
					/>
				</div>
				<CustomButton
					:text="$t('generic.edit')"
					color="default"
					left-icon="edit"
					size="xs"
					variant="ghost"
					@click="navigateToEditTags"
				/>
			</div>

			<hr class="border-base-300 text-base-300" />

			<TextArea
				v-model="bio"
				:maxlength="1000"
				:rows="8"
				class="w-full"
				:label-bottom="$t('profile.bioVisibility')"
				:label-top="$t('profile.bio')"
				name="bio"
				:placeholder="$t('profile.bioPlaceholder')"
			/>

			<hr class="border-base-300 text-base-300" />
		</div>
		<div
			class="w-full flex justify-center p-4 border-t border-t-base-300 shadow"
		>
			<CustomButton
				:text="$t('generic.saveChanges')"
				color="primary"
				left-icon="check"
				size="lg"
				@click="handleSave"
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { ref } from 'vue';
	import PictureUpload from '~/components/Profile/PictureUpload.vue';
	import CustomButton from '~/components/CustomButton/CustomButton.vue';
	import TextArea from '~/components/inputField/TextArea.vue';
	import { HttpMethods } from '#shared/enums/enums';

	const userStore = useUserStore();
	if (!userStore.user) {
		userStore
			.refetchCurrentUser()
			.then(() => {
				userStore.fetchSupervisorProfile(
					userStore.user?.id || '',
				);
				imgSrc.value =
					userStore.user?.profile_image || '';
				firstName.value =
					userStore.user?.first_name || '';
				lastName.value =
					userStore.user?.last_name || '';
			})
			.catch(() => {
				console.error(
					'Error fetching user data in profile page',
				);
			});
	}

	if (!userStore.supervisorProfile) {
		userStore
			.fetchSupervisorProfile(userStore.user?.id || '')
			.then(() => {
				bio.value =
					userStore.supervisorProfile?.bio || '';
			});
	}

	const imgSrc = ref<string>(userStore.user?.profile_image || '');
	const firstName = ref(userStore.user?.first_name || '');
	const lastName = ref(userStore.user?.last_name || '');
	const bio = ref(userStore.supervisorProfile?.bio || '');
	const buttonIsLoading = ref(false);

	const updateProfileImage = (base64: string) => {
		$fetch('/api/users/' + userStore.user?.id, {
			method: HttpMethods.PATCH,
			body: {
				profile_image: base64,
			},
		}).finally(() => {
			userStore.refetchCurrentUser();
		});
		imgSrc.value = base64;
	};

	// TODO: implement the logic to navigate to edit tags and edit them
	const navigateToEditTags = () => {
		console.log('Navigate to edit tags');
	};

	const handleSave = async () => {
		if (!userStore.user) {
			await userStore.refetchCurrentUser();
		}
		if (!userStore.supervisorProfile) {
			await userStore.fetchSupervisorProfile(
				userStore.user?.id || '',
			);
		}

		if (
			firstName.value !== userStore.user?.first_name ||
			lastName.value !== userStore.user?.last_name ||
			imgSrc.value !== userStore.user?.profile_image
		) {
			const { status } = useFetch(
				'/api/users/' + userStore.user?.id,
				{
					method: HttpMethods.PATCH,
					body: {
						first_name: firstName.value,
						last_name: lastName.value,
						profile_image: imgSrc.value,
					},
				},
			);
			await userStore.refetchCurrentUser();
			watch(status, async (status) => {
				buttonIsLoading.value = status === 'pending';
			});
		}
		if (bio.value !== userStore.supervisorProfile?.bio) {
			const { status } = useFetch(
				'/api/supervisors/' +
					userStore.supervisorProfile?.id,
				{
					method: HttpMethods.PATCH,
					body: {
						bio: bio.value,
					},
				},
			);
			await userStore.fetchSupervisorProfile(
				userStore.user?.id || '',
			);
			watch(status, async (status) => {
				buttonIsLoading.value = status === 'pending';
			});
		}
	};

	// TODO: implement the logic to navigate to profile preview
	const navigateToPreview = () => {
		// Navigate to the profile preview page
		// TODO: implement the logic, this is only a placeholder
		// router.push('/profile-preview');
	};

	// TODO: implement the logic to remove tags
	const removeTag = (tag) => {
		// tags.value = tags.value.filter(t => t.id !== tag.id);
		console.log('Removing tag:', tag);
	};

	if (!userStore.user) {
		await userStore.refetchCurrentUser();
	}
	const tags = ref<Array<unknown>>([]);
	const { data } = useFetch<Array<unknown>>(
		'/api/users/' + userStore.user?.id + '/tags',
		{
			method: HttpMethods.GET,
		},
	);
	watch(data, () => {
		tags.value = data.value || [];
	});
</script>
