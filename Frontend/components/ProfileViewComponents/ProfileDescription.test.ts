import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProfileDescription from './ProfileDescription.vue'
import { useMediaQuery } from '@vueuse/core'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key // Return the key as is for testing
    })
}))

// Mock useMediaQuery
vi.mock('@vueuse/core', async () => {
    return {
        useMediaQuery: vi.fn().mockReturnValue({ value: false })
    }
})

// Mock the CustomButton component
const CustomButton = {
    name: 'CustomButton',
    template: '<button :class="color" @click="$emit(\'click\')"><slot></slot></button>',
    props: [ 'color', 'text', 'leftIcon', 'size', 'variant' ]
}

beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    // Reset useMediaQuery mock to default value
    vi.mocked(useMediaQuery).mockImplementation(() => ({ value: false }))
})

describe('ProfileDescription', () => {
    const defaultProps = {
        headline: 'Test Headline',
        content: 'Test content'
    }

    const mountComponent = (props = defaultProps) => {
        return mount(ProfileDescription, {
            props,
            global: {
                components: {
                    CustomButton
                }
            }
        })
    }

    it('renders headline and content correctly', () => {
        const wrapper = mountComponent()
        expect(wrapper.find('h3').text()).toBe('Test Headline')
        expect(wrapper.find('p').text()).toBe('Test content')
    })

    it('does not show button when content is shorter than maxLength', () => {
        const wrapper = mountComponent({
            headline: 'Test',
            content: 'a'.repeat(100)
        })
        expect(wrapper.findComponent(CustomButton).exists()).toBe(false)
    })

    it('shows button when content is longer than maxLength', () => {
        const wrapper = mountComponent({
            headline: 'Test',
            content: 'a'.repeat(151)
        })
        expect(wrapper.findComponent(CustomButton).exists()).toBe(true)
    })

    it('truncates content when not expanded and content is longer than maxLength', () => {
        const wrapper = mountComponent({
            headline: 'Test',
            content: 'a'.repeat(200)
        })
        expect(wrapper.find('p').text()).toBe('a'.repeat(150) + '...')
    })


    it('toggles isOpen when button is clicked', async () => {
        const wrapper = mountComponent({
            headline: 'Test',
            content: 'a'.repeat(200)
        })

        const button = wrapper.findComponent(CustomButton)
        expect(button.props('leftIcon')).toBe('eye')

        await button.trigger('click')
        expect(button.props('leftIcon')).toBe('eye')
    })
})
