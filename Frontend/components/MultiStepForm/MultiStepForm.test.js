import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import MultiStepForm from './MultiStepForm.vue'

describe('MultiStepForm.vue', () => {
  it('advances steps and emits submit only once', async () => {
    const wrapper = mount(MultiStepForm, {
      props: {
        totalSteps: 2
      },
      slots: {
        step1: '<div>Step 1 content</div>',
        step2: '<div>Step 2 content</div>'
      }
    })

    expect(wrapper.html()).toContain('Step 1 content')
    expect(wrapper.html()).not.contain('Step 2 content')
    
    await wrapper.find('[data-test="next-button"').trigger('click')
    expect(wrapper.html()).toContain('Step 2 content')

    await wrapper.find('[data-test="submit-button"').trigger('click')

    //can not trigger the submit button directly since this test simulates a DOM which does not have proper bubbling of events
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.emitted('submit').length).toBe(1)
  })
})