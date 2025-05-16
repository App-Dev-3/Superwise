import {describe, expect, it} from 'vitest';
import {mount} from '@vue/test-utils';
import ValidatedMailInput from './ValidatedMailInput.vue';

// Mock FontAwesomeIcon
vi.mock('@fortawesome/vue-fontawesome', () => ({
    FontAwesomeIcon: {
        name: 'FontAwesomeIcon',
        props: ['icon'],
        template: '<i class="fa-mock"></i>'
    }
}));

describe('ValidatedMailInput', () => {
    const defaultProps = {
        errorMessage: 'Invalid email',
        placeholder: 'Enter email',
        modelValue: '',
        domain: 'fhstp.ac.at'
    };

    it('renders correctly with required props', () => {
        const wrapper = mount(ValidatedMailInput, {
            props: defaultProps
        });
        expect(wrapper.exists()).toBe(true);
        expect(wrapper.find('input').attributes('placeholder')).toBe('Enter email');
        expect(wrapper.find('span').text()).toContain('@fhstp.ac.at');
    });

    it('emits update:modelValue event when input changes', async () => {
        const wrapper = mount(ValidatedMailInput, {
            props: defaultProps
        });

        const input = wrapper.find('input');
        await input.setValue('test');

        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')[0]).toEqual(['test']);
    });

    it('emits blur event when input loses focus', async () => {
        const wrapper = mount(ValidatedMailInput, {
            props: defaultProps
        });

        const input = wrapper.find('input');
        await input.trigger('blur');

        expect(wrapper.emitted('blur')).toBeTruthy();
        expect(wrapper.emitted('blur')).toHaveLength(1);
    });

    it('filters invalid characters from input', async () => {
        const wrapper = mount(ValidatedMailInput, {
            props: defaultProps,
            attachTo: document.body // To ensure proper event handling
        });

        // Create an input event with special characters
        wrapper.find('input');
        const inputEvent = {
            target: {
                value: 'test@$%^&user name'
            }
        };

        // Call the handleInput method directly
        await wrapper.vm.handleInput(inputEvent);

        // Verify the invalid characters were filtered out
        expect(inputEvent.target.value).toBe('test%username');
        expect(wrapper.emitted('update:modelValue')[0]).toEqual(['test%username']);
    });

    it('trims whitespace from input', async () => {
        const wrapper = mount(ValidatedMailInput, {
            props: defaultProps,
            attachTo: document.body
        });
        wrapper.find('input');
        const inputEvent = {
            target: {
                value: '  test.user  '
            }
        };

        await wrapper.vm.handleInput(inputEvent);

        expect(inputEvent.target.value).toBe('test.user');
        expect(wrapper.emitted('update:modelValue')[0]).toEqual(['test.user']);
    });
});
