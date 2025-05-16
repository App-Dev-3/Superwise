import {describe, expect, it, vi} from 'vitest';
import {shallowMount} from '@vue/test-utils';
import StudentCard from './StudentCard.vue';

// Mock the dependencies
vi.mock('~/components/Avatar/Avatar.vue', () => ({
    default: {
        name: 'Avatar',
        props: ['firstName', 'lastName', 'src', 'alt', 'shape', 'size'],
        template: '<div class="avatar-mock"></div>'
    }
}));

vi.mock('~/components/CustomButton/CustomButton.vue', () => ({
    default: {
        name: 'CustomButton',
        props: ['color', 'leftIcon', 'size', 'text', 'variant'],
        template: '<button class="custom-button-mock"></button>'
    }
}));

describe('StudentCard', () => {
    const defaultProps = {
        editMode: false,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@fhstp.ac.at',
        src: ''
    };

    it('renders correctly with required props', () => {
        const wrapper = shallowMount(StudentCard, {
            props: defaultProps,
            global: {
                stubs: {
                    Avatar: true,
                    CustomButton: true
                }
            }
        });
        expect(wrapper.exists()).toBe(true);
        expect(wrapper.find('.text-body').text()).toBe('John Doe');
        expect(wrapper.find('.text-x-small').text()).toBe('john.doe@fhstp.ac.at');
    });

    it('does not show remove button when not in edit mode', () => {
        const wrapper = shallowMount(StudentCard, {
            props: defaultProps,
            global: {
                stubs: {
                    Avatar: true,
                    CustomButton: true
                }
            }
        });
        expect(wrapper.find('.custom-button-mock').exists()).toBe(false);
    });

    it('shows remove button when in edit mode', () => {
        const wrapper = shallowMount(StudentCard, {
            props: {
                ...defaultProps,
                editMode: true
            },
            global: {
                stubs: {
                    Avatar: true,
                    CustomButton: true
                }
            }
        });
        expect(wrapper.find('[color="error"]').exists()).toBe(true);
    });

    it('adds border style when in edit mode', () => {
        const wrapper = shallowMount(StudentCard, {
            props: {
                ...defaultProps,
                editMode: true
            },
            global: {
                stubs: {
                    Avatar: true,
                    CustomButton: true
                }
            }
        });
        expect(wrapper.attributes('class')).toContain('border-b-1');
        expect(wrapper.attributes('class')).toContain('border-b-error');
    });

    it('emits click event when remove button is clicked', async () => {
        const wrapper = shallowMount(StudentCard, {
            props: {
                ...defaultProps,
                editMode: true
            },
            global: {
                stubs: {
                    Avatar: true,
                    CustomButton: true
                }
            }
        });

        // Find the CustomButton and trigger click
        const button = wrapper.findComponent({name: 'CustomButton'});
        await button.vm.$emit('click');

        expect(wrapper.emitted('click')).toBeTruthy();
        expect(wrapper.emitted('click')).toHaveLength(1);
    });
});
