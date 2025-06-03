import {mount} from '@vue/test-utils';
import {describe, expect, it, vi} from 'vitest';
import CustomToggle from './CustomToggle.vue';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

// Mock FontAwesomeIcon component
vi.mock('@fortawesome/vue-fontawesome', () => ({
    FontAwesomeIcon: {
        name: 'FontAwesomeIcon',
        props: ['icon', 'aria-label'],
        template: '<span :data-icon="icon" :aria-label="ariaLabel"></span>'
    }
}));

describe('CustomToggle.vue', () => {
    it('renders without icons when no icon props are provided', () => {
        const wrapper = mount(CustomToggle);

        expect(wrapper.find('input.toggle[type="checkbox"]').exists()).toBe(true);
    });

    it('renders with icons when both icon props are provided', () => {
        const wrapper = mount(CustomToggle, {
            props: {
                onIcon: 'check',
                offIcon: 'times'
            }
        });

        expect(wrapper.find('input.toggle').exists()).toBe(false);
        expect(wrapper.find('label.toggle').exists()).toBe(true);
        expect(wrapper.findAllComponents(FontAwesomeIcon).length).toBe(2);
    });

    it('reflects the checked state from props', async () => {
        const wrapper = mount(CustomToggle, {
            props: {
                checked: true
            }
        });

        expect(wrapper.find('input[type="checkbox"]').element.checked).toBe(true);

        await wrapper.setProps({checked: false});
        expect(wrapper.find('input[type="checkbox"]').element.checked).toBe(false);
    });

    it('emits update:checked event when toggled without icons', async () => {
        const wrapper = mount(CustomToggle);

        await wrapper.find('input[type="checkbox"]').setValue(true);

        expect(wrapper.emitted('update:checked')).toBeTruthy();
        expect(wrapper.emitted('update:checked')[0]).toEqual([true]);
    });

    it('emits update:checked event when toggled with icons', async () => {
        const wrapper = mount(CustomToggle, {
            props: {
                onIcon: 'check',
                offIcon: 'times'
            }
        });

        await wrapper.find('label.toggle input[type="checkbox"]').setValue(true);

        expect(wrapper.emitted('update:checked')).toBeTruthy();
        expect(wrapper.emitted('update:checked')[0]).toEqual([true]);
    });

    it('shows the correct icon based on checked state', async () => {
        const wrapper = mount(CustomToggle, {
            props: {
                checked: false,
                onIcon: 'check',
                offIcon: 'times'
            }
        });

        const iconElements = wrapper.findAllComponents(FontAwesomeIcon);
        expect(iconElements.length).toBe(2);
        expect(iconElements[0].attributes('aria-label')).toBe('enabled');
        expect(iconElements[1].attributes('aria-label')).toBe('disabled');

        await wrapper.setProps({checked: true});
        // The icons remain the same, only the toggle state changes
        expect(wrapper.find('input[type="checkbox"]').element.checked).toBe(true);
    });
});