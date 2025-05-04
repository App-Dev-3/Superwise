import {mount} from '@vue/test-utils'
import {describe, expect, it, vi} from 'vitest'
import ActionCard from './ActionCard.vue'

describe('ActionCard.vue', () => {
    it('renders header text when headerText prop is provided', () => {
        const wrapper = mount(ActionCard, {
            props: {headerText: 'Header'}
        })
        expect(wrapper.text()).toContain('Header')
    })

    it('does not render header text when headerText prop is empty', () => {
        const wrapper = mount(ActionCard)
        expect(wrapper.text()).not.toContain('Header')
    })

    it('renders button with default text when buttonText prop is not provided', () => {
        const wrapper = mount(ActionCard)
        expect(wrapper.findComponent({name: 'CustomButton'}).props('text')).toBe('Click Me')
    })

    it('renders button with custom text when buttonText prop is provided', () => {
        const wrapper = mount(ActionCard, {
            props: {buttonText: 'Submit'}
        })
        expect(wrapper.findComponent({name: 'CustomButton'}).props('text')).toBe('Submit')
    })

    it('emits action event and calls action prop when button is clicked', async () => {
        const actionMock = vi.fn()
        const wrapper = mount(ActionCard, {
            props: {action: actionMock}
        })
        const buttonWrapper = wrapper.findComponent({name: 'CustomButton'})
        await buttonWrapper.find('button').trigger('click')
        expect(actionMock).toHaveBeenCalled()
        expect(wrapper.emitted()).toHaveProperty('action')
        expect(wrapper.emitted().action).toHaveLength(1)
    })

    it('accepts only valid cardType values', () => {
        const validTypes = ['ghost', 'primary']
        validTypes.forEach(type => {
            const wrapper = mount(ActionCard, {
                props: {cardType: type}
            })
            expect(wrapper.props('cardType')).toBe(type)
        })
    })

    it('renders slot content', () => {
        const wrapper = mount(ActionCard, {
            slots: {default: '<div class="slot-content">Slot Content</div>'}
        })
        expect(wrapper.find('.slot-content').exists()).toBe(true)
    })
})
