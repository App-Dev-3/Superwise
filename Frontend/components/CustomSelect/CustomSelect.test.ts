import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import CustomSelect from './CustomSelect.vue';

// Mock FontAwesomeIcon to avoid errors
vi.mock('@fortawesome/vue-fontawesome', () => ({
    FontAwesomeIcon: {
        name: 'FontAwesomeIcon',
        template: '<span class="mock-icon"></span>'
    }
}));

describe('CustomSelect', () => {
    const options = [
        { key: 'option1', value: 'Option 1' },
        { key: 'option2', value: 'Option 2' },
        { key: 'option3', value: 'Option 3' }
    ];

    it('renders properly', () => {
        const wrapper = mount(CustomSelect);
        expect(wrapper.find('.dropdown').exists()).toBe(true);
    });

    it('renders placeholder when provided', () => {
        const placeholder = 'Select an option';
        const wrapper = mount(CustomSelect, {
            props: { placeholder }
        });

        const dropdownButton = wrapper.find('.btn');
        expect(dropdownButton.text()).toContain(placeholder);
    });

    it('renders modelValue option text when option is selected', () => {
        const wrapper = mount(CustomSelect, {
            props: {
                options,
                modelValue: 'option2'
            }
        });

        const dropdownButton = wrapper.find('.btn');
        expect(dropdownButton.text()).toContain('Option 2');
    });

    it('renders all options when provided', () => {
        const wrapper = mount(CustomSelect, {
            props: { options }
        });

        const menuItems = wrapper.findAll('.dropdown-content li');
        expect(menuItems.length).toBe(options.length);

        options.forEach((option, index) => {
            expect(menuItems[index].text()).toContain(option.value);
        });
    });

    it('marks the option that matches modelValue as selected', async () => {
        const wrapper = mount(CustomSelect, {
            props: {
                options,
                modelValue: 'option2'
            }
        });

        const menuItems = wrapper.findAll('.dropdown-content li a');
        const selectedItem = menuItems[1]; // option2 is the second item
        expect(selectedItem.text()).toContain('✅');
    });

    it('emits update:modelValue event when an option is selected', async () => {
        const wrapper = mount(CustomSelect, {
            props: { options }
        });

        // Simulate clicking on an option
        await wrapper.findAll('.dropdown-content li')[2].trigger('click');

        const emittedEvents = wrapper.emitted('update:modelValue');
        expect(emittedEvents).toBeTruthy();
        expect(emittedEvents?.[0]).toEqual([ 'option3' ]);
    });

    it('works with numeric values', async () => {
        const numericOptions = [
            { key: 1, value: 'Option 1' },
            { key: 2, value: 'Option 2' }
        ];

        const wrapper = mount(CustomSelect, {
            props: {
                options: numericOptions,
                modelValue: 1
            }
        });

        // Check that the selected option is shown in the button
        const dropdownButton = wrapper.find('.btn');
        expect(dropdownButton.text()).toContain('Option 1');

        // Simulate clicking on the second option
        await wrapper.findAll('.dropdown-content li')[1].trigger('click');

        const emittedEvents = wrapper.emitted('update:modelValue');
        expect(emittedEvents).toBeTruthy();
        expect(emittedEvents?.[0]).toEqual([ 2 ]);
    });
});
