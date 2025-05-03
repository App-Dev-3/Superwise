import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import SupervisorCard from './SupervisorCard.vue'
import CustomTag from '../CustomTag/CustomTag.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUserGroup, faHourglass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faUserGroup, faHourglass)

describe('SupervisorCard', () => {
    const defaultProps = {
        image: 'test-image.jpg',
        firstName: 'John',
        lastName: 'Doe',
        tags: ['tag1', 'tag2', 'tag3'],
        similarityScore: 75,
        maxCapacity: 100,
        currentCapacity: 50,
    }

    const globalComponents = {
        CustomTag,
        FontAwesomeIcon
    }

    it('renders correctly with required props', () => {
        const wrapper = mount(SupervisorCard, {
            props: defaultProps,
            global: {
                components: globalComponents
            }
        })

        expect(wrapper.find('img').attributes('src')).toBe(defaultProps.image)
        expect(wrapper.text()).toContain(defaultProps.firstName)
        expect(wrapper.text()).toContain(defaultProps.lastName)

        // Check tags
        const tags = wrapper.findAllComponents(CustomTag)
        expect(tags).toHaveLength(6) // 3 regular tags + similarity score + capacity + pending

        // Check scores and capacity
        const scoreTag = wrapper.findAllComponents(CustomTag)
            .find(tag => tag.props('text') === '75%')
        expect(scoreTag).toBeTruthy()

        const capacityTag = wrapper.findAllComponents(CustomTag)
            .find(tag => tag.props('text') === '50/100 ')
        expect(capacityTag).toBeTruthy()
        expect(capacityTag.props('rightIcon')).toBe('user-group')
    })

    it('displays optional description when provided', () => {
        const description = 'This is a test description'
        const wrapper = mount(SupervisorCard, {
            props: {
                ...defaultProps,
                description
            },
            global: {
                components: globalComponents
            }
        })

        expect(wrapper.text()).toContain(description)
    })

    it('displays pending amount badge when provided', () => {
        const wrapper = mount(SupervisorCard, {
            props: {
                ...defaultProps,
                pendingAmount: 5
            },
            global: {
                components: globalComponents
            }
        })

        const pendingTag = wrapper.findAllComponents(CustomTag)
            .find(tag => tag.props('text') === '5 ')
        expect(pendingTag).toBeTruthy()
        expect(pendingTag.props('rightIcon')).toBe('hourglass')
    })

    it('limits the number of displayed tags according to maxTagAmount', () => {
        const wrapper = mount(SupervisorCard, {
            props: {
                ...defaultProps,
                tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
                maxTagAmount: 3
            },
            global: {
                components: globalComponents
            }
        })

        const regularTags = wrapper.findAllComponents(CustomTag)
            .filter(tag => !tag.props('rightIcon') && !tag.props('text').includes('%'))
        expect(regularTags).toHaveLength(3)
    })
})