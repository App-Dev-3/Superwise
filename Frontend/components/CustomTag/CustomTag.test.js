import { mount } from '@vue/test-utils'
import CustomTag from './CustomTag.vue'
import { describe, it, expect } from 'vitest'

describe('CustomTag.vue', () => {

  it('renders the tag name', () => {
    const wrapper = mount(CustomTag, {
      props: {
        name: 'TestTag'
      }
    })
    expect(wrapper.text()).toContain('TestTag')
  })

  it('applies correct background and text classes based on color prop', () => {
    const wrapper = mount(CustomTag, {
      props: {
        color: 'secondary'
      }
    })
    expect(wrapper.classes()).toContain('bg-secondary')
    expect(wrapper.classes()).toContain('text-secondary-content')
  })

  it('emits "click" when badge is clicked if clickable and not deletable', async () => {
    const wrapper = mount(CustomTag, {
      props: {
        clickable: true,
        deletable: false
      }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does NOT emit "click" if deletable is true even if clickable', async () => {
    const wrapper = mount(CustomTag, {
      props: {
        clickable: true,
        deletable: true
      }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('renders delete icon if deletable is true', () => {
    const wrapper = mount(CustomTag, {
      props: {
        deletable: true
      }
    })
    expect(wrapper.find('[data-test="icon"]').exists()).toBe(true)
  })

  it('emits "delete" when delete icon is clicked', async () => {
    const wrapper = mount(CustomTag, {
      props: {
        deletable: true
      }
    })
    const icon = wrapper.find('[data-test="icon"]')
    await icon.trigger('click')
    expect(wrapper.emitted('delete')).toBeTruthy()
  })

})
