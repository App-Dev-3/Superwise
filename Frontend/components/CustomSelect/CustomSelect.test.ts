import {mount} from '@vue/test-utils';
import {describe, expect, it} from 'vitest';
import CustomSelect from './CustomSelect.vue';

describe('CustomSelect', () => {
    const options = [
        {key: 'option1', value: 'Option 1'},
        {key: 'option2', value: 'Option 2'},
        {key: 'option3', value: 'Option 3'}
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
            expect(optionElements[index].text()).toBe(option.value);
            expect(optionElements[index].attributes('value')).toBe(String(option.key));
        });
    });

    it('selects the option that matches modelValue', async () => {
        const wrapper = mount(CustomSelect, {
            props: {
                options,
                modelValue: 'option2'
            }
        });

        const selected = wrapper.find('option[value="option2"]');
        expect(selected.element.selected).toBe(true);
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
            {key: 1, value: 'Option 1'},
            {key: 2, value: 'Option 2'}
        ];

        const wrapper = mount(CustomSelect, {
            props: {
                options: numericOptions,
                modelValue: 1
            }
        });

        const selected = wrapper.find('option[value="1"]');
        expect(selected.element.selected).toBe(true);

        await wrapper.find('select').setValue('2');
        const emittedEvents = wrapper.emitted('update:modelValue');
        expect(emittedEvents).toBeTruthy();
        expect(emittedEvents?.[0]).toEqual(['2']);
    });
});

