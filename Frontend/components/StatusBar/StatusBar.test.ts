import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBar from './StatusBar.vue'

const mockFontAwesomeIcon = {
    name: 'FontAwesomeIcon',
    template: '<span><slot /></span>'
}

describe('StatusBar', () => {
    const createWrapper = (props = {}) => {
        return mount(StatusBar, {
            props,
            global: {
                components: {
                    FontAwesomeIcon: mockFontAwesomeIcon
                }
            }
        })
    }

    it('renders three steps', () => {
        const wrapper = createWrapper()
        const steps = wrapper.findAll('li.step')
        expect(steps).toHaveLength(3)
    })

    it('correctly applies step-primary class based on current step', () => {
        const wrapper = createWrapper({ step: 2 })
        const steps = wrapper.findAll('li.step')

        // First two steps should be primary, last step should not
        expect(steps[0].classes()).toContain('step-primary')
        expect(steps[1].classes()).toContain('step-primary')
        expect(steps[2].classes()).not.toContain('step-primary')
    })

    it('applies small text class when smallText prop is true', () => {
        const wrapper = createWrapper({ smallText: true })
        const steps = wrapper.findAll('li.step')

        steps.forEach(step => {
            expect(step.classes()).toContain('text-sm')
        })
    })

    it('does not apply small text class when smallText prop is false', () => {
        const wrapper = createWrapper({ smallText: false })
        const steps = wrapper.findAll('li.step')

        steps.forEach(step => {
            expect(step.classes()).not.toContain('text-sm')
        })
    })

    it('renders with default props', () => {
        const wrapper = createWrapper()
        expect(wrapper.props('step')).toBe(1)
        expect(wrapper.props('smallText')).toBe(true)
    })

    it('handles step 3 correctly', () => {
        const wrapper = createWrapper({ step: 3 })
        const steps = wrapper.findAll('li.step')

        expect(steps[0].classes()).toContain('step-primary')
        expect(steps[1].classes()).toContain('step-primary')
        expect(steps[2].classes()).toContain('step-primary')
    })
})