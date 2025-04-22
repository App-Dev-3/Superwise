import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InputField from './InputField.vue'

describe('InputField.vue', () => {
  it('renders the label and note from props', () => {
    const wrapper = mount(InputField, {
      props: {
        label: 'Test Label',
        note: 'Optional note',
      },
    })

    expect(wrapper.text()).toContain('Test Label')
    expect(wrapper.text()).toContain('Optional note')
  })

  it('emits "field-value" when input loses focus', async () => {
    const wrapper = mount(InputField, {
      props: {
        label: 'Name',
        note: 'Required',
      },
    })

    const input = wrapper.find('input')
    await input.setValue('John Doe')
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('blur')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['John Doe'])
  })
})