import {mount} from '@vue/test-utils'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import ProfileDescription from './ProfileDescription.vue'
import {useMediaQuery} from '@vueuse/core'

// Mock useMediaQuery
vi.mock('@vueuse/core', async () => {
    return {
        useMediaQuery: vi.fn().mockReturnValue({value: false})
    }
})

// Mock the CustomButton component
const CustomButton = {
    name: 'CustomButton',
    template: '<button :class="color" @click="$emit(\'click\')"><slot></slot></button>',
    props: ['color', 'text', 'leftIcon', 'size', 'variant']
}

beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    // Reset useMediaQuery mock to default value
    vi.mocked(useMediaQuery).mockImplementation(() => ({value: false}))
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

    it('applies line-clamp-4 class when isOpen is false', () => {
        const wrapper = mountComponent()
        expect(wrapper.find('p').classes()).toContain('line-clamp-4')
    })

    describe('buttonNeeded computed property', () => {
        it('shows button for extra small screen with content > 100 chars', async () => {
            // Setup mock to return true for extra small screen
            const mockUseMediaQuery = vi.fn()
            mockUseMediaQuery.mockImplementation((query: string) => ({
                value: query === '(max-width: 639px)'
            }))
            vi.mocked(useMediaQuery).mockImplementation(mockUseMediaQuery)

            const wrapper = mountComponent({
                headline: 'Test',
                content: 'a'.repeat(101)
            })

            expect(wrapper.findComponent(CustomButton).exists()).toBe(true)
        })

        it('shows button for small screen with content > 160 chars', async () => {
            // Setup mock to return true for small screen
            const mockUseMediaQuery = vi.fn()
            mockUseMediaQuery.mockImplementation((query: string) => ({
                value: query === '(max-width: 767px) and (min-width: 640px)'
            }))
            vi.mocked(useMediaQuery).mockImplementation(mockUseMediaQuery)

            const wrapper = mountComponent({
                headline: 'Test',
                content: 'a'.repeat(161)
            })

            expect(wrapper.findComponent(CustomButton).exists()).toBe(true)
        })

        it('does not show button when content is shorter than threshold', () => {
            const wrapper = mountComponent({
                headline: 'Test',
                content: 'Short content'
            })

            expect(wrapper.findComponent(CustomButton).exists()).toBe(false)
        })
    })
})