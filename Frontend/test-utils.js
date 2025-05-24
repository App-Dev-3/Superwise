import {createI18n} from 'vue-i18n';
import {config} from '@vue/test-utils';

// Minimal i18n messages for tests
const messages = {
    en: {
        searchBar: {
            noResults: 'No results found',
        },
        statusBar: {
            onboarding: 'Onboarding',
            matching: 'Matching',
            confirmed: 'Confirmed',
        },
        tagSelector: {
            tagCount: '{count}/{max}',
        },
        generic: {
            showAll: 'Show all',
            cancel: 'Cancel',
        },
        multiStepForm: {
            next: 'Next',
            startMatching: 'Start Matching',
        },
        appHeader: {
            searchPlaceholder: 'Search...',
            back: 'Back',
        },
        modal: {
            dontShowAgain: "Don't show again"
        }
    }
};

export function getI18n() {
    return createI18n({
        legacy: false,
        locale: 'en',
        fallbackLocale: 'en',
        messages,
        silentTranslationWarn: true,
        silentFallbackWarn: true,
        missingWarn: false,
        fallbackWarn: false
    });
}

// Optionally, register global components here for tests
export function registerGlobalComponents() {
    config.global.components = {
        ...(config.global.components || {}),
        CustomTag: {
            template: '<div><slot /></div>'
        }
    };
}

