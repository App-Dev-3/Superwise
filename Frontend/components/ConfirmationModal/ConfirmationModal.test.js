import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ConfirmationModal from './ConfirmationModal.vue';

// Mock FontAwesomeIcon component
vi.mock('@fortawesome/vue-fontawesome', () => ({
    FontAwesomeIcon: {
        name: 'FontAwesomeIcon',
        template: '<span data-testid="icon" />',
    },
}));

// Mock CustomButton component
const CustomButton = {
    name: 'CustomButton',
    props: ['block', 'size', 'text', 'variant', 'color', 'leftIcon'],
    template: '<button @click="$emit(\'click\')" :data-color="color" :data-variant="variant" :data-icon="leftIcon">{{ text }}</button>',
    emits: ['click'],
};

describe('ConfirmationModal', () => {
    // Default props for testing
    const defaultProps = {
        linkedComponentId: 'test-modal',
        headline: 'Test Headline',
        icon: 'test-icon',
        description: 'Test Description',
        confirmButtonText: 'Confirm',
        confirmButtonColor: 'info',
    };

    // Mocks for HTMLDialogElement methods
    let showModalSpy;
    let closeModalSpy;

    beforeEach(() => {
        // Create mock HTMLDialogElement methods
        showModalSpy = vi.fn();
        closeModalSpy = vi.fn();

        // Mock document.getElementById
        vi.spyOn(document, 'getElementById').mockImplementation(() => ({
            showModal: showModalSpy,
            close: closeModalSpy,
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders correctly with minimal props', () => {
        const wrapper = mount(ConfirmationModal, {
            props: defaultProps,
            global: {
                stubs: {
                    CustomButton,
                    FontAwesomeIcon: true,
                },
            },
        });

        // Basic structure checks
        expect(wrapper.find('dialog').exists()).toBe(true);
        expect(wrapper.find('dialog').attributes('id')).toBe('test-modal');
        expect(wrapper.find('dialog').classes()).toContain('modal');
        expect(wrapper.find('h3').text()).toBe(defaultProps.headline);
        expect(wrapper.find('p').text()).toBe(defaultProps.description);

        // Check buttons
        const buttons = wrapper.findAll('button');
        expect(buttons.length).toBe(2);
        expect(buttons[0].text()).toBe('Cancel');
        expect(buttons[1].text()).toBe('Confirm');
    });

    it('renders with all optional props', () => {
        const props = {
            ...defaultProps,
            image: 'test-image.jpg',
            warning: 'Custom Warning',
            cancelButtonText: 'Go Back',
            confirmButtonIcon: 'check-circle',
        };

        const wrapper = mount(ConfirmationModal, {
            props,
            global: {
                stubs: {
                    CustomButton,
                    FontAwesomeIcon: true,
                },
            },
        });

        // Check optional elements
        expect(wrapper.find('.mask.mask-squircle').exists()).toBe(true);
        expect(wrapper.find('img').attributes('src')).toBe('test-image.jpg');
        expect(wrapper.find('.text-sm').text()).toContain('Custom Warning');

        // Check customized buttons
        const buttons = wrapper.findAll('button');
        expect(buttons[0].text()).toBe('Go Back');
        expect(buttons[1].attributes('data-icon')).toBe('check-circle');
    });

    it('emits confirm event and closes modal when confirm button is clicked', async () => {
        const wrapper = mount(ConfirmationModal, {
            props: defaultProps,
            global: {
                stubs: {
                    CustomButton,
                    FontAwesomeIcon: true,
                },
            },
        });

        // Click confirm button and check events
        await wrapper.findAll('button')[1].trigger('click');
        await flushPromises();

        expect(wrapper.emitted()).toHaveProperty('confirm');
        expect(closeModalSpy).toHaveBeenCalled();
    });

    it('emits abort event and closes modal when cancel button is clicked', async () => {
        const wrapper = mount(ConfirmationModal, {
            props: defaultProps,
            global: {
                stubs: {
                    CustomButton,
                    FontAwesomeIcon: true,
                },
            },
        });

        // Click cancel button and check events
        await wrapper.findAll('button')[0].trigger('click');
        await flushPromises();

        expect(wrapper.emitted()).toHaveProperty('abort');
        expect(closeModalSpy).toHaveBeenCalled();
    });

    it('emits abort and closes modal when Escape key is pressed', async () => {
        const wrapper = mount(ConfirmationModal, {
            props: defaultProps,
            global: {
                stubs: {
                    CustomButton,
                    FontAwesomeIcon: true,
                },
            },
        });

        // Simulate dialog cancel event (Escape key)
        await wrapper.find('dialog').trigger('cancel');
        await flushPromises();

        expect(wrapper.emitted()).toHaveProperty('abort');
        expect(closeModalSpy).toHaveBeenCalled();
    });

    it('emits dontShowAgain when checkbox is checked and button is clicked', async () => {
        const wrapper = mount(ConfirmationModal, {
            props: defaultProps,
            global: {
                stubs: {
                    CustomButton,
                    FontAwesomeIcon: true,
                },
            },
        });

        // Check the "Don't show again" checkbox
        await wrapper.find('input[type="checkbox"]').setValue(true);

        // Click confirm button
        await wrapper.findAll('button')[1].trigger('click');
        await flushPromises();

        expect(wrapper.emitted()).toHaveProperty('confirm');
        expect(wrapper.emitted()).toHaveProperty('dontShowAgain');
        expect(closeModalSpy).toHaveBeenCalled();
    });

    it('does not emit dontShowAgain when checkbox is unchecked', async () => {
        const wrapper = mount(ConfirmationModal, {
            props: defaultProps,
            global: {
                stubs: {
                    CustomButton,
                    FontAwesomeIcon: true,
                },
            },
        });

        // Leave checkbox unchecked (default state)
        await wrapper.findAll('button')[1].trigger('click');
        await flushPromises();

        expect(wrapper.emitted()).toHaveProperty('confirm');
        expect(wrapper.emitted()).not.toHaveProperty('dontShowAgain');
    });

    it('handles multiple modals with unique IDs correctly', () => {
        const wrapper1 = mount(ConfirmationModal, {
            props: {
                ...defaultProps,
                linkedComponentId: 'modal-1',
            },
            global: {
                stubs: {
                    CustomButton,
                    FontAwesomeIcon: true,
                },
            },
        });

        const wrapper2 = mount(ConfirmationModal, {
            props: {
                ...defaultProps,
                linkedComponentId: 'modal-2',
            },
            global: {
                stubs: {
                    CustomButton,
                    FontAwesomeIcon: true,
                },
            },
        });

        expect(wrapper1.find('dialog').attributes('id')).toBe('modal-1');
        expect(wrapper2.find('dialog').attributes('id')).toBe('modal-2');
    });

    it('uses the correct styling classes for modal components', () => {
        const wrapper = mount(ConfirmationModal, {
            props: defaultProps,
            global: {
                stubs: {
                    CustomButton,
                    FontAwesomeIcon: true,
                },
            },
        });

        // Check daisyUI classes
        expect(wrapper.find('dialog').classes()).toContain('modal');
        expect(wrapper.find('.modal-box').exists()).toBe(true);
        expect(wrapper.find('.checkbox').exists()).toBe(true);
    });
});