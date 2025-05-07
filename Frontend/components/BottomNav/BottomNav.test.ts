import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BottomNav from './BottomNav.vue'

// Mock FontAwesomeIcon component to avoid issues with icon loading
const mockFontAwesomeIcon = {
    name: 'FontAwesomeIcon',
    render: () => {},
}

describe('BottomNav', () => {
    const createWrapper = (props = {}) => {
        return mount(BottomNav, {
            props,
            global: {
                components: {
                    FontAwesomeIcon: mockFontAwesomeIcon,
                },
            },
        })
    }

    it('renders all navigation buttons', () => {
        const wrapper = createWrapper()
        const buttons = wrapper.findAll('button')
        expect(buttons).toHaveLength(3)
    })

    it('shows labels when alwaysShowLabels is true', () => {
        const wrapper = createWrapper({ alwaysShowLabels: true })
        const labels = wrapper.findAll('.dock-label')
        expect(labels).toHaveLength(3)
        expect(labels[0].text()).toBe('Dashboard')
        expect(labels[1].text()).toBe('Matching')
        expect(labels[2].text()).toBe('Chat')
    })

    it('hides all labels when alwaysShowLabels is false and showLabelsOnActive is false', () => {
        const wrapper = createWrapper({
            alwaysShowLabels: false,
            showLabelsOnActive: false
        })
        const labels = wrapper.findAll('.dock-label')
        expect(labels).toHaveLength(0)
    })

    it('shows only active label when showLabelsOnActive is true and alwaysShowLabels is false', () => {
        const wrapper = createWrapper({
            activeRoute: '/matching',
            alwaysShowLabels: false,
            showLabelsOnActive: true
        })
        const labels = wrapper.findAll('.dock-label')
        expect(labels).toHaveLength(1)
        expect(labels[0].text()).toBe('Matching')
    })

    it('adds dock-active class to active route button', () => {
        const wrapper = createWrapper({ activeRoute: '/matching' })
        const activeButton = wrapper.find('.dock-active')
        expect(activeButton.exists()).toBe(true)
        expect(wrapper.findAll('.dock-active')).toHaveLength(1)
    })

    it('emits navigate event with correct route when button is clicked', async () => {
        const wrapper = createWrapper()
        const buttons = wrapper.findAll('button')

        await buttons[0].trigger('click')
        expect(wrapper.emitted('navigate')).toBeTruthy()
        expect(wrapper.emitted('navigate')[0]).toEqual(['/dashboard'])

        await buttons[1].trigger('click')
        expect(wrapper.emitted('navigate')[1]).toEqual(['/matching'])

        await buttons[2].trigger('click')
        expect(wrapper.emitted('navigate')[2]).toEqual(['/chat'])
    })

    it('renders with default activeRoute when none provided', () => {
        const wrapper = createWrapper()
        const activeButton = wrapper.find('.dock-active')
        // Check if the button with matching route is active
        expect(activeButton.exists()).toBe(true)
        // Since default is '/dashboard'
        expect(wrapper.findAll('button')[0].classes()).toContain('dock-active')
    })
})