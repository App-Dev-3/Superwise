import {defineStore} from 'pinia';
import {ref, watch} from 'vue';

export const useSettingsStore = defineStore('settings', () => {
    // Helper function to get value from localStorage with proper typing
    const getFromStorage = <T>(key: string, defaultValue: T): T => {
        if (typeof localStorage === 'undefined') return defaultValue;

        const storedValue = localStorage.getItem(key);
        if (storedValue === null) return defaultValue;

        // Handle booleans specially
        if (typeof defaultValue === 'boolean') {
            return (storedValue === 'true') as unknown as T;
        }

        return storedValue as unknown as T;
    };

    // Initialize with values from localStorage or defaults
    const language = ref(getFromStorage<string>('sw-language', 'en'));

    // Modal confirmation settings - initialize from localStorage
    const showSupervisionRequestModal = ref(getFromStorage<boolean>('sw-showSupervisionRequestModal', true));
    const showDismissModal = ref(getFromStorage<boolean>('sw-showDismissModal', true));
    const showChatRequestAcceptModal = ref(getFromStorage<boolean>('sw-showChatRequestAcceptModal', true));
    const showChatRequestRejectModal = ref(getFromStorage<boolean>('sw-showChatRequestRejectModal', true));
    const showSupervisionAcceptModal = ref(getFromStorage<boolean>('sw-showSupervisionAcceptModal', true));
    const showSupervisionRejectModal = ref(getFromStorage<boolean>('sw-showSupervisionRejectModal', true));
    const showAddStudentModal = ref(getFromStorage<boolean>('sw-showAddStudentModal', true));

    // App info
    const notificationId = '9286ff4c-c811-4848-8f90-4dd67770a894';

    // Set up watchers to persist changes to localStorage
    if (typeof window !== 'undefined') {
        watch(language, (newValue) => {
            localStorage.setItem('sw-language', newValue);
        });

        watch(showSupervisionRequestModal, (newValue) => {
            localStorage.setItem('sw-showSupervisionRequestModal', String(newValue));
        });

        watch(showDismissModal, (newValue) => {
            localStorage.setItem('sw-showDismissModal', String(newValue));
        });

        watch(showChatRequestAcceptModal, (newValue) => {
            localStorage.setItem('sw-showChatRequestAcceptModal', String(newValue));
        });

        watch(showChatRequestRejectModal, (newValue) => {
            localStorage.setItem('sw-showChatRequestRejectModal', String(newValue));
        });

        watch(showSupervisionAcceptModal, (newValue) => {
            localStorage.setItem('sw-showSupervisionAcceptModal', String(newValue));
        });

        watch(showSupervisionRejectModal, (newValue) => {
            localStorage.setItem('sw-showSupervisionRejectModal', String(newValue));
        });

        watch(showAddStudentModal, (newValue) => {
            localStorage.setItem('sw-showAddStudentModal', String(newValue));
        });
    }

    // Function to save all settings at once
    const saveAllSettings = () => {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('sw-language', language.value);
            localStorage.setItem('sw-showSupervisionRequestModal', String(showSupervisionRequestModal.value));
            localStorage.setItem('sw-showDismissModal', String(showDismissModal.value));
            localStorage.setItem('sw-showChatRequestAcceptModal', String(showChatRequestAcceptModal.value));
            localStorage.setItem('sw-showChatRequestRejectModal', String(showChatRequestRejectModal.value));
            localStorage.setItem('sw-showSupervisionAcceptModal', String(showSupervisionAcceptModal.value));
            localStorage.setItem('sw-showSupervisionRejectModal', String(showSupervisionRejectModal.value));
            localStorage.setItem('sw-showAddStudentModal', String(showAddStudentModal.value));
        }
    };

    return {
        // App settings
        language,

        // Modal settings
        showSupervisionRequestModal,
        showDismissModal,
        showChatRequestAcceptModal,
        showChatRequestRejectModal,
        showSupervisionAcceptModal,
        showSupervisionRejectModal,
        showAddStudentModal,

        // App info
        notificationId,

        // Methods
        saveAllSettings
    };
});
