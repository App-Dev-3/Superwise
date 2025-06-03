<script lang="ts" setup>

interface PictureUploadProps {
  imgSrc?: string;
  firstName: string;
  lastName: string;
  emoji?: string;
  ringColor?: "primary" | "secondary" | "accent" | "neutral" | "info" | "success" | "warning" | "error";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const props = withDefaults(defineProps<PictureUploadProps>(), {
  emoji: '',
  ringColor: 'primary',
  size: 'md',
    imgSrc: '',
});

const acceptedTypes = computed(() => {
  return '.jpg,.jpeg,.png,.webp';
});

const emit = defineEmits<{
  (e: 'fileUploaded' | 'error', value: string): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const error = ref<string | null>(null);
const loading = ref(false);

const handleFile = async (file: File) => {
  try {
    const base64Image = await fileToBase64(file);
    emit('fileUploaded', base64Image);
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'File processing error');
  }
};

const handleChange = async (event: Event) => {
  error.value = null;
  loading.value = true;

  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    await handleFile(file);
  } finally {
    loading.value = false;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

</script>

<template>
  <div class="flex flex-col gap-4 items-center justify-center">
    <input
        ref="fileInput"
        :accept="acceptedTypes"
        class="hidden"
        type="file"
        @change="handleChange"
    >
    <Avatar
        :emoji="props.emoji"
        :first-name="props.firstName"
        :last-name="props.lastName"
        :ring-color="props.ringColor"
        :size="props.size"
        :src="props.imgSrc"
        add-button
        alt="Profile Picture of {{ props.firstName }} {{ props.lastName }}"
        shape="circle"
        @click="fileInput?.click()"
    />
  </div>
</template>