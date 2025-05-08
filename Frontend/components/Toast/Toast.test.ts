import {mount} from '@vue/test-utils'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import Toast from './Toast.vue'
import {nextTick} from 'vue'

// Mock the FontAwesomeIcon component
vi.mock('@fortawesome/vue-fontawesome', () => ({
    FontAwesomeIcon: {
        name: 'FontAwesomeIcon',
        props: ['icon'],
        template: '<span data-testid="mock-icon" :data-icon="icon">icon</span>'
    }
}))

// Mock the CustomButton component
const CustomButton = {
    name: 'CustomButton',
    props: ['text', 'color'],
    template: '<button data-testid="custom-button">{{ text }}</button>'
}

describe('Toast.vue', () => {
    beforeEach(() => {
        // Reset timers before each test
        vi.useFakeTimers()
    })

    afterEach(() => {
        // Clean up after each test
        vi.restoreAllMocks()
    })

    it('renders correctly with default props', () => {
        const wrapper = mount(Toast, {
            global: {
                components: {
                    CustomButton
                }
            }
        })

        expect(wrapper.find('.alert').exists()).toBe(true)
        expect(wrapper.find('.alert-success').exists()).toBe(true)
        expect(wrapper.find('[data-icon="check"]').exists()).toBe(true)
        expect(wrapper.text()).toContain('Chat request has been sent')
        expect(wrapper.find('[data-testid="custom-button"]').text()).toBe('close')
    })

    it('is not visible when show is false', () => {
        const wrapper = mount(Toast, {
            props: {
                show: false
            },
            global: {
                components: {
                    CustomButton
                }
            }
        })

        expect(wrapper.find('.alert').exists()).toBe(false)
    })

    it('uses correct classes and icons for error type', () => {
        const wrapper = mount(Toast, {
            props: {
                type: 'error'
            },
            global: {
                components: {
                    CustomButton
                }
            }
        })

        expect(wrapper.find('.alert-error').exists()).toBe(true)
        expect(wrapper.find('[data-icon="xmark"]').exists()).toBe(true)
    })

    it('uses correct classes and icons for exception type', () => {
        const wrapper = mount(Toast, {
            props: {
                type: 'exception'
            },
            global: {
                components: {
                    CustomButton
                }
            }
        })

        expect(wrapper.find('.alert-error').exists()).toBe(true)
        expect(wrapper.find('[data-icon="triangle-exclamation"]').exists()).toBe(true)
    })

    it('displays custom message', () => {
        const customMessage = 'Custom test message'
        const wrapper = mount(Toast, {
            props: {
                message: customMessage
            },
            global: {
                components: {
                    CustomButton
                }
            }
        })

        expect(wrapper.text()).toContain(customMessage)
    })

    it('displays custom button text', () => {
        const customButtonText = 'Dismiss'
        const wrapper = mount(Toast, {
            props: {
                buttonText: customButtonText
            },
            global: {
                components: {
                    CustomButton
                }
            }
        })

        expect(wrapper.find('[data-testid="custom-button"]').text()).toBe(customButtonText)
    })

    it('emits close event when button is clicked but remains visible', async () => {
        const wrapper = mount(Toast, {
            global: {
                components: {
                    CustomButton
                }
            }
        })

        await wrapper.find('[data-testid="custom-button"]').trigger('click')
        expect(wrapper.emitted().buttonClick).toBeTruthy()
        expect(wrapper.emitted().buttonClick.length).toBe(1)
        // Toast should still be visible
        expect(wrapper.find('.alert').exists()).toBe(true)
    })

    it('disappears and emits close event after the specified duration', async () => {
        const wrapper = mount(Toast, {
            props: {
                duration: 2000
            },
            global: {
                components: {
                    CustomButton
                }
            }
        })

        // Initially visible
        expect(wrapper.find('.alert').exists()).toBe(true)

        // Fast-forward time
        vi.advanceTimersByTime(2000)
        await nextTick()

        // Should now be hidden and have emitted close event
        expect(wrapper.find('.alert').exists()).toBe(false)
        expect(wrapper.emitted().buttonClick).toBeTruthy()
        expect(wrapper.emitted().buttonClick.length).toBe(1)
    })

    it('does not disappear if duration is 0', async () => {
        const wrapper = mount(Toast, {
            props: {
                duration: 0
            },
            global: {
                components: {
                    CustomButton
                }
            }
        })

        // Fast-forward time
        vi.advanceTimersByTime(5000)
        await nextTick()

        // Should still be visible and no close event emitted
        expect(wrapper.find('.alert').exists()).toBe(true)
        expect(wrapper.emitted().buttonClick).toBeFalsy()
    })

    it('updates visibility when show prop changes', async () => {
        const wrapper = mount(Toast, {
            props: {
                show: true
            },
            global: {
                components: {
                    CustomButton
                }
            }
        })

        // Initially visible
        expect(wrapper.find('.alert').exists()).toBe(true)

        // Update show prop to false
        await wrapper.setProps({show: false})

        // Should now be hidden
        expect(wrapper.find('.alert').exists()).toBe(false)
    })
})
