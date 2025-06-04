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
        expect(wrapper.find('[data-icon="ban"]').exists()).toBe(true)
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

    it('emits buttonClick event when button is clicked and remains visible', async () => {
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
        // Toast should still be visible after button click
        expect(wrapper.find('.alert').exists()).toBe(true)
        // Should not emit close event when button is clicked
        expect(wrapper.emitted().close).toBeFalsy()
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
        expect(wrapper.emitted().close).toBeTruthy()
        expect(wrapper.emitted().close.length).toBe(1)
        // Should not emit buttonClick event on auto-close
        expect(wrapper.emitted().buttonClick).toBeFalsy()
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
        expect(wrapper.emitted().close).toBeFalsy()
        expect(wrapper.emitted().buttonClick).toBeFalsy()
    })

    it('emits different events for button click and auto-close', async () => {
        const wrapper = mount(Toast, {
            props: {
                duration: 3000
            },
            global: {
                components: {
                    CustomButton
                }
            }
        })

        // Click button first
        await wrapper.find('[data-testid="custom-button"]').trigger('click')
        expect(wrapper.emitted().buttonClick).toBeTruthy()
        expect(wrapper.emitted().buttonClick.length).toBe(1)
        expect(wrapper.emitted().close).toBeFalsy()

        // Then wait for auto-close
        vi.advanceTimersByTime(3000)
        await nextTick()

        expect(wrapper.emitted().close).toBeTruthy()
        expect(wrapper.emitted().close.length).toBe(1)
        expect(wrapper.emitted().buttonClick.length).toBe(1) // Still just one from earlier
    })
})

