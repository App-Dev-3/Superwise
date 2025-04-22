import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import AppHeader from './AppHeader.vue'

const mockBack = vi.fn()


//mock the router
vi.mock('vue-router', () => ({
    useRouter: () => ({
      back: mockBack
    })
  }
))

// Basic stub for InputField
const InputFieldStub = {
  template: '<input @blur="$emit(\'blur\')" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  props: ['modelValue']
}

describe('AppHeader.vue', () => {
  it('renders the search field when the icon is clicked', async () => {
    const wrapper = mount(AppHeader, {
      props: { showSearch: true },
      global: {
        stubs: { InputField: InputFieldStub }
      }
    })

    expect(wrapper.findComponent(InputFieldStub).exists()).toBe(false)

    await wrapper.find('[data-test="search-button"]').trigger('click')

    expect(wrapper.findComponent(InputFieldStub).exists()).toBe(true)
  })

  it('emits update:modelValue when the text field is updated', async () => {
    const wrapper = mount(AppHeader, {
      props: { showSearch: true },
      global: {
        stubs: { InputField: InputFieldStub }
      }
    })

    await wrapper.find('[data-test="search-button"]').trigger('click')

    const input = wrapper.findComponent(InputFieldStub)
    await input.vm.$emit('update:modelValue', 'hello')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['hello'])
  })

  it('goes back when the back button is clicked', async () => {
    const wrapper = mount(AppHeader, {
      props: { showBack: true },
      global: {
        stubs: { InputField: InputFieldStub }
      }
    })

    await wrapper.find('[data-test="back-button"]').trigger('click')
    expect(mockBack).toHaveBeenCalled()
  })
})
