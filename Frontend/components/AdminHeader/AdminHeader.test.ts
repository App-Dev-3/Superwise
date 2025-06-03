import {beforeEach, describe, expect, it, vi} from 'vitest';
import {config, mount} from '@vue/test-utils';
import AdminHeader from './AdminHeader.vue';
// Import the mocked router to verify calls

// Mock the CustomButton component to emit click events correctly
config.global.components = {
    CustomButton: {
        template: '<button @click="$emit(\'click\')"><slot /></button>',
        props: ['color', 'leftIcon', 'text', 'variant', 'class'],
        emits: ['click']
    }
};

// Mock the vue-router
vi.mock('vue-router', () => ({
    useRouter: () => ({
        back: vi.fn()
    })
}));

// Mock computed
vi.mock('vue', async () => {
    const actual = await vi.importActual('vue');
    return {
        ...actual,
        computed: vi.fn().mockImplementation((fn) => fn())
    };
});

describe('AdminHeader', () => {

    beforeEach(() => {
        // Reset the router mock before each test
        vi.clearAllMocks();
    });

    it('renders with default variant correctly', () => {
        const wrapper = mount(AdminHeader, {
            props: {
                headerText: 'Default Header'
            }
        });

        // Check the default background class is applied
        expect(wrapper.find('div').classes()).toContain('bg-base-100');

        // Check text color class
        expect(wrapper.find('span').classes()).toContain('text-base-content');
    });

    it('renders with upload variant correctly', () => {
        const wrapper = mount(AdminHeader, {
            props: {
                variant: 'upload',
                headerText: 'Upload Header'
            }
        });

        expect(wrapper.find('div').classes()).toContain('bg-info');
        expect(wrapper.find('span').classes()).toContain('text-info-content');
    });

    it('renders with download variant correctly', () => {
        const wrapper = mount(AdminHeader, {
            props: {
                variant: 'download',
                headerText: 'Download Header'
            }
        });

        expect(wrapper.find('div').classes()).toContain('bg-success');
        expect(wrapper.find('span').classes()).toContain('text-success-content');
    });

    it('renders with delete variant correctly', () => {
        const wrapper = mount(AdminHeader, {
            props: {
                variant: 'delete',
                headerText: 'Delete Header'
            }
        });

        expect(wrapper.find('div').classes()).toContain('bg-error');
        expect(wrapper.find('span').classes()).toContain('text-error-content');
    });


    it('displays the provided header text', () => {
        const headerText = 'Test Header';
        const wrapper = mount(AdminHeader, {
            props: {
                headerText
            }
        });

        // Check if the text content matches what was provided
        expect(wrapper.find('span').text()).toBe(headerText);
    });

    it('displays no text in the header if no prop is passed', () => {
        const wrapper = mount(AdminHeader);

        // Check if the text content is "Upload"
        expect(wrapper.find('span').text()).toBe('');
    });

    it('validates variant prop correctly', () => {
        // Create component with valid variant
        const validWrapper = mount(AdminHeader, {
            props: {
                variant: 'upload',
                headerText: 'Test Header'
            }
        });
        expect(validWrapper.props().variant).toBe('upload');

        // Instead of accessing the internal Vue structure, we test the behavior
        // Set up console warning spy
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
        });

        // Valid variants should mount without warnings
        mount(AdminHeader, {props: {variant: 'default', headerText: 'Test Header'}});
        mount(AdminHeader, {props: {variant: 'upload', headerText: 'Test Header'}});
        mount(AdminHeader, {props: {variant: 'download', headerText: 'Test Header'}});
        mount(AdminHeader, {props: {variant: 'delete', headerText: 'Test Header'}});

        // We can't directly test the validator function, but we can check 
        // that Vue doesn't warn for valid variants
        expect(warnSpy).not.toHaveBeenCalled();

        // Clean up
        warnSpy.mockRestore();
    });
});
