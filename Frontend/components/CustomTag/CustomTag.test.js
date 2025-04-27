import { mount } from '@vue/test-utils'
import customeTag from './CustomTag.vue'
import { describe, it, expect, vi } from 'vitest'

describe('CustomTag.vue', () => {
  
  it('renders the name passed as prop', () => {
    const wrapper = mount(customeTag, {
      props: {
        name: 'TestTag'
      }
    })
    expect(wrapper.text()).toContain('TestTag')
  })

  it('applies correct classes based on color', () => {
    const wrapper = mount(customeTag, {
      props: {
        color: 'secondary'
      }
    })
    expect(wrapper.classes()).toContain('bg-secondary')
    expect(wrapper.classes()).toContain('text-secondary-content')
  })

  it('emits click when X icon is clicked and clickable is true', async () => {
    const wrapper = mount(customeTag, {
      props: {
        clickable: true
      }
    })
    const icon = wrapper.find('[data-test="icon"]')
    await icon.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click if not clickable', async () => {
    const wrapper = mount(customeTag, {
      props: {
        clickable: false
      }
    })
    const icon = wrapper.find('[data-test="icon"]')
    expect(icon.exists()).toBe(false)
  })

})
