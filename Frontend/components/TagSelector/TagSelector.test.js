import { mount } from '@vue/test-utils'
import TagSelector from './TagSelector.vue'
import { describe, it, expect } from 'vitest'

describe('TagSelector.vue', () => {

  const allTags = [{tag_name:'AI'}, {tag_name:'Programming'}, {tag_name:'Web Dev'}, {tag_name:'Design'},
    {tag_name:'Data Science'}, {tag_name:'ML'},{tag_name: 'UI/UX'}]

  it('renders initial selected tags', () => {
    const wrapper = mount(TagSelector, {
      props: {
        allTags,
        initialSelected: [{tag_name:'AI'}, {tag_name:'Programming'}]
      },
      global: {
        stubs: {
          'custom-tag': {
            props: ['text'],
            template: '<div>{{ text }}</div>'
          }
        }
      }
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
      }
    })

    const firstTag = wrapper.find('[data-test="tags"] custom-tag')
    await firstTag.trigger('click')

    expect(wrapper.emitted('update:selectedTags')).toBeTruthy()
    expect(wrapper.emitted('update:selectedTags')[0][0].length).toBe(1)
  })

  it('displays correct tag counter', () => {
    const wrapper = mount(TagSelector, {
      props: {
        allTags,
        initialSelected: ['AI', 'Programming', 'Design']
      }
    })

    const counter = wrapper.find('[data-test="selected-tags-count"]')
    expect(counter.text()).toBe('3/10')
  })
})
