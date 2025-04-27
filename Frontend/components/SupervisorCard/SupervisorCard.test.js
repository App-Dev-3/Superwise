import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import SupervisorCard from './SupervisorCard.vue'

describe('SupervisorCard', () => {
    const defaultProps = {
        image: 'test-image.jpg',
        name: 'John Doe',
        tags: ['tag1', 'tag2', 'tag3'],
        similarityScore: 75,
        maxCapacity: 100,
        currentCapacity: 50,
    }

    it('renders correctly with required props', () => {
        const wrapper = mount(SupervisorCard, {
            props: defaultProps
        })

        expect(wrapper.find('img').attributes('src')).toBe(defaultProps.image)
        expect(wrapper.text()).toContain(defaultProps.name)
        expect(wrapper.text()).toContain('75 %') // similarity score
        expect(wrapper.text()).toContain('50/100') // capacity
    })


    it('displays optional description when provided', () => {
        const description = 'This is a test description'
        const wrapper = mount(SupervisorCard, {
            props: {
                ...defaultProps,
                description
            }
        })

        expect(wrapper.text()).toContain(description)
    })

    it('displays pending amount badge when provided', () => {
        const wrapper = mount(SupervisorCard, {
            props: {
                ...defaultProps,
                pendingAmount: 5
            }
        })

        expect(wrapper.text()).toContain('5')
    })
})