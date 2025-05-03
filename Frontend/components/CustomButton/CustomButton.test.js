import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CustomButton from "./CustomButton.vue";
describe('CustomButton.vue', () => {
    // Test basic rendering
    it('renders with default props', () => {
        const wrapper = mount(CustomButton)
        expect(wrapper.text()).toBe('Click Me')
        expect(wrapper.find('button').classes()).toContain('btn')
        expect(wrapper.find('button').classes()).toContain('btn-primary')
        expect(wrapper.find('button').classes()).toContain('btn-md')
    })

    // Test text prop
    it('renders with custom text', () => {
        const wrapper = mount(CustomButton, {
            props: {
                text: 'Submit Form'
            }
        })
        expect(wrapper.text()).toBe('Submit Form')
    })

    // Test color prop
    it('applies the correct color class', () => {
        const wrapper = mount(CustomButton, {
            props: {
                color: 'success'
            }
        })
        expect(wrapper.find('button').classes()).toContain('btn-success')
        expect(wrapper.find('button').classes()).not.toContain('btn-primary')
    })

    // Test size prop
    it('applies the correct size class', () => {
        const wrapper = mount(CustomButton, {
            props: {
                size: 'lg'
            }
        })
        expect(wrapper.find('button').classes()).toContain('btn-lg')
        expect(wrapper.find('button').classes()).not.toContain('btn-md')
    })

    // Test variant prop
    it('applies the correct variant class', () => {
        const wrapper = mount(CustomButton, {
            props: {
                variant: 'outline'
            }
        })
        expect(wrapper.find('button').classes()).toContain('btn-outline')
    })

    // Test wide prop
    it('applies the wide class when wide prop is true', () => {
        const wrapper = mount(CustomButton, {
            props: {
                wide: true
            }
        })
        expect(wrapper.find('button').classes()).toContain('btn-wide')
    })

    // Test block prop
    it('applies the block class when block prop is true', () => {
        const wrapper = mount(CustomButton, {
            props: {
                block: true
            }
        })
        expect(wrapper.find('button').classes()).toContain('btn-block')
    })

    // Test disabled state
    it('disables the button when isActive is false', () => {
        const wrapper = mount(CustomButton, {
            props: {
                isActive: false
            }
        })
        expect(wrapper.find('button').classes()).toContain('btn-disabled')
    })

    // Test loading state
    it('shows loading state when isLoading is true', () => {
        const wrapper = mount(CustomButton, {
            props: {
                isLoading: true
            }
        })
        expect(wrapper.find('button').classes()).toContain('btn-loading')
        expect(wrapper.find('.loading')).toBeTruthy()
    })

    // Test top text
    it('renders top text when topText prop is provided', () => {
        const wrapper = mount(CustomButton, {
            props: {
                topText: 'topText'
            }
        })
        expect(wrapper.find('.text-sm').exists()).toBe(true)
        expect(wrapper.find('.text-sm').text()).toBe('topText')
    })

    // Test click event
    it('emits click event when clicked', async () => {
        const wrapper = mount(CustomButton)
        await wrapper.find('button').trigger('click')
        expect(wrapper.emitted()).toHaveProperty('click')
        expect(wrapper.emitted().click).toHaveLength(1)
    })

    // Test validation of props
    it('throws warning when both wide and block are set to true', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mount(CustomButton, {
            props: {
                wide: true,
                block: true
            }
        })
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("classes 'wide' and 'block' cannot be used together"))
        consoleSpy.mockRestore()
    })
})