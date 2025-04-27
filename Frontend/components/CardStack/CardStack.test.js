import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import CardStack from "./CardStack.vue";
describe('CardStack', () => {
    it('renders the correct number of cards based on amount prop', () => {
        const wrapper = mount(CardStack, {
            props: {
                amount: 3
            },
            slots: {
                default: '<div data-test="card">Test Card</div>'
            }
        })

        const cards = wrapper.findAll('[data-test="card"]')
        expect(cards.length).toBe(3)
    })

    it('renders custom content when provided in the slot', () => {
        const wrapper = mount(CardStack, {
            props: {
                amount: 1
            },
            slots: {
                default: '<div data-test="custom-content">Custom Content</div>'
            }
        })

        expect(wrapper.find('[data-test="custom-content"]').exists()).toBe(true)
        expect(wrapper.text()).toContain('Custom Content')
    })
})