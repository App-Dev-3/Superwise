import {mount} from '@vue/test-utils'
import TagSelector from './TagSelector.vue'
import {describe, expect, it} from 'vitest'
import {getI18n} from '../../test-utils'

describe('TagSelector.vue', () => {

    const allTags = [{tag_name: 'AI'}, {tag_name: 'Programming'}, {tag_name: 'Web Dev'}, {tag_name: 'Design'},
        {tag_name: 'Data Science'}, {tag_name: 'ML'}, {tag_name: 'UI/UX'}]

    const CustomTagStub = {name: 'CustomTag', props: ['text'], template: '<div>{{ text }}</div>'};
    const globalConfig = {
        plugins: [getI18n()],
        stubs: {
            CustomTag: CustomTagStub
        }
    }

    it('renders initial selected tags', () => {
        const wrapper = mount(TagSelector, {
            props: {
                allTags,
                initialSelected: [{tag_name: 'AI'}, {tag_name: 'Programming'}]
            },
            global: globalConfig
        })

        const selectedArea = wrapper.find('[data-test="selected-tags"]')

        expect(selectedArea.text()).toContain('AI')
        expect(selectedArea.text()).toContain('Programming')
    })

    it('emits update:selectedTags when selecting a tag', async () => {
        const wrapper = mount(TagSelector, {
            props: {
                allTags,
                initialSelected: []
            },
            global: globalConfig
        })

        // Use findAllComponents to get the first CustomTag
        const tagComponents = wrapper.findAllComponents(CustomTagStub)
        expect(tagComponents.length).toBeGreaterThan(0)
        await tagComponents[0].trigger('click')

        expect(wrapper.emitted('update:selectedTags')).toBeTruthy()
        expect(wrapper.emitted('update:selectedTags')[0][0].length).toBe(1)
    })

    it('displays correct tag counter', () => {
        const wrapper = mount(TagSelector, {
            props: {
                allTags,
                initialSelected: ['AI', 'Programming', 'Design']
            },
            global: globalConfig
        })

        const counter = wrapper.find('[data-test="selected-tags-count"]')
        expect(counter.text()).toBe('3 / 10')
    })
})
