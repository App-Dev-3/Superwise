import {mount} from '@vue/test-utils';
import {describe, expect, it} from 'vitest';
import CustomSelect from './CustomSelect.vue';

describe('CustomSelect', () => {
    const options = [
        {value: 'option1', label: 'Option 1'},
        {value: 'option2', label: 'Option 2'},
        {value: 'option3', label: 'Option 3'}
    ];

    it('renders properly', () => {
        const wrapper = mount(CustomSelect);
        expect(wrapper.find('select').exists()).toBe(true);
    });

    it('renders placeholder when provided', () => {
        const placeholder = 'Select an option';
        const wrapper = mount(CustomSelect, {
            props: {placeholder}
        });

        const placeholderOption = wrapper.find('option[value=""]');
        expect(placeholderOption.exists()).toBe(true);
        expect(placeholderOption.text()).toBe(placeholder);
    });

    it('does not render placeholder when empty string', () => {
        const wrapper = mount(CustomSelect, {
            props: {placeholder: ''}
        });

        const placeholderOption = wrapper.find('option[value=""]');
        expect(placeholderOption.exists()).toBe(false);
    });

    it('renders all options when provided', () => {
        const wrapper = mount(CustomSelect, {
            props: {options}
        });

        const optionElements = wrapper.findAll('option:not([value=""])');
        expect(optionElements.length).toBe(options.length);

        options.forEach((option, index) => {
            expect(optionElements[index].text()).toBe(option.label);
            expect(optionElements[index].attributes('value')).toBe(String(option.value));
        });
    });

    it('selects the option that matches modelValue', async () => {
        const wrapper = mount(CustomSelect, {
            props: {
                options,
                modelValue: 'option2'
            }
        });

        expect(wrapper.find('select').element.value).toBe('option2');
    });

    it('emits update:modelValue event when an option is selected', async () => {
        const wrapper = mount(CustomSelect, {
            props: {options}
        });

        // Simulate selecting an option
        await wrapper.find('select').setValue('option3');

        const emittedEvents = wrapper.emitted('update:modelValue');
        expect(emittedEvents).toBeTruthy();
        expect(emittedEvents?.[0]).toEqual(['option3']);
    });

    it('works with numeric values', async () => {
        const numericOptions = [
            {value: 1, label: 'Option 1'},
            {value: 2, label: 'Option 2'}
        ];

        const wrapper = mount(CustomSelect, {
            props: {
                options: numericOptions,
                modelValue: 1
            }
        });

        expect(wrapper.find('select').element.value).toBe('1');

        await wrapper.find('select').setValue('2');
        const emittedEvents = wrapper.emitted('update:modelValue');
        expect(emittedEvents).toBeTruthy();
        expect(emittedEvents?.[0]).toEqual(['2']);
    });
});

