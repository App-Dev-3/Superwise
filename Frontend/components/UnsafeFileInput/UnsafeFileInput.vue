<script setup lang="ts">
    // this should give type safety and autocomplete in the ide,
    // we should have used this from the start lol
    import type {ParsedCsv, TagSimilarityData, Base64Image, CsvRow} from "#shared/types/fileUploadTypes";
    import Papa from 'papaparse';

    interface Props {
        fileType: 'json' | 'csv' | 'image';
        buttonText?: string;
        buttonColor?: string;
        buttonTopText?: string;
        buttonWidth?: 'fit-content' | 'wide' | 'block';
        disabled?: boolean;
    }

    const props = withDefaults(defineProps<Props>(), {
        buttonText: 'Upload File',
        buttonColor: 'primary',
        buttonTopText: '',
        buttonWidth: 'fit-content',
        disabled: false,
    });

    type FileTypeContent = {
        'json': TagSimilarityData;
        'csv': ParsedCsv;
        'image': Base64Image;
    }

    const emit = defineEmits<{
        <T extends Props['fileType']>(
            e: 'fileUploaded',
            filename: string,
            content: FileTypeContent[T]
        ): void;
        (e: 'error', message: string): void;
    }>();

    const fileInput = ref<HTMLInputElement | null>(null);
    const error = ref<string | null>(null);
    const loading = ref(false);

    const acceptedTypes = computed(() => {
        switch (props.fileType) {
            case 'json': return '.json';
            case 'csv': return '.csv';
            case 'image': return '.jpg,.jpeg,.png,.webp';
            default: return '';
        }
    });

    const handleFile = async (file: File) => {
        try {
            switch (props.fileType) {
                case 'json':
                    {
                        const jsonText = await file.text();
                        emit('fileUploaded', file.name, JSON.parse(jsonText));
                        break; 
                    }
                case 'csv':
                    {
                        const csvArray = await csvToArray(file);
                        emit('fileUploaded', file.name, csvArray);
                        break;
                    }
                case 'image':
                    {
                        const base64Image = await fileToBase64(file);
                        emit('fileUploaded', file.name, base64Image);
                        break;
                    }
            }
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

    const csvToArray = (file: File): Promise<ParsedCsv> => {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: false,
                delimiter: '',
                complete: (results) => {
                    if (results.errors && results.errors.length > 0) {
                        console.error('CSV parsing errors:', results.errors);
                        reject(new Error('Error parsing CSV file: ' + results.errors[0].message));
                        return;
                    }

                    if (!results.data || results.data.length === 0) {
                        reject(new Error('CSV must have headers and data'));
                        return;
                    }

                    const parsedData = results.data as CsvRow[];
                    resolve(parsedData);
                },
                error: (error) => {
                    reject(new Error('Error parsing CSV file: ' + error.message));
                }
            });
        });
    };

</script>

<template>
    <input
        ref="fileInput"
        type="file"
        :accept="acceptedTypes"
        class="hidden"
        @change="handleChange"
    >
    <CustomButton
        :is-active="!props.disabled"
        :text="props.buttonText"
        left-icon="cloud-arrow-up"
        :top-text="props.buttonTopText"
        :is-loading="loading"
        :color="props.buttonColor"
        :wide="props.buttonWidth === 'wide'"
        :block="props.buttonWidth === 'block'"
        @click="fileInput?.click()"
    />

</template>