import { describe, it, expect, vi} from 'vitest'
import { mount } from '@vue/test-utils'
import BottomNav from './BottomNav.vue'

// Mock FontAwesomeIcon component to avoid issues with icon loading
const mockFontAwesomeIcon = {
    name: 'FontAwesomeIcon',
    render: () => {},
}
vi.mock('vue-router', () => ({
    useRoute: vi.fn(() => ({
        path: ''
    }))
}))


describe('BottomNav', () => {
    // Default button array for testing
    const defaultButtons = [
        { label: 'Dashboard', icon: 'house', route: '/dashboard' },
        { label: 'Matching', icon: 'user-group', route: '/matching' },
        { label: 'Chat', icon: 'message', route: '/chat' }
    ]

    const createWrapper = (props = {}) => {
        return mount(BottomNav, {
            props: {
                // Always provide bottomNavButtons as required prop
                bottomNavButtons: defaultButtons,
                activeRoute: '/dashboard',
                ...props
            },
            global: {
                components: {
                    FontAwesomeIcon: mockFontAwesomeIcon,
                },
            },
        })
    }

    it('renders all navigation buttons from provided props', () => {
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

    it('renders with custom navigation buttons when provided', () => {
        const customButtons = [
            { label: 'Home', icon: 'home', route: '/' },
            { label: 'Settings', icon: 'cog', route: '/settings' }
        ]

        const wrapper = createWrapper({
            bottomNavButtons: customButtons,
        })

        const buttons = wrapper.findAll('button')
        expect(buttons).toHaveLength(2)
    })
});