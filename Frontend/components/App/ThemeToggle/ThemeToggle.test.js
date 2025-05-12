import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CustomToggle from './ThemeToggle.vue';

vi.mock('#imports', () => ({
    useColorMode: () => ({
        value: 'light',
        preference: 'light'
    })
}));

describe('CustomToggle', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(CustomToggle);
    });

    it('renders the toggle component', () => {
        expect(wrapper.find('.toggle').exists()).toBe(true);
        expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
        expect(wrapper.find('svg[aria-label="sun"]').exists()).toBe(true);
        expect(wrapper.find('svg[aria-label="moon"]').exists()).toBe(true);
    });

    it('checkbox should be unchecked by default when theme is light', () => {
        const checkbox = wrapper.find('input[type="checkbox"]');
        expect(checkbox.element.checked).toBe(false);
    });

});