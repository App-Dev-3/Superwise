import {describe, expect, it} from 'vitest';
import {shallowMount} from '@vue/test-utils';
import SupervisorStudentList from './SupervisorStudentList.vue';

// Mock the child components
vi.mock('~/components/SupervisorStudentList/StudentCard.vue', () => ({
    default: {
        name: 'StudentCard',
        props: ['editMode', 'email', 'firstName', 'lastName', 'src'],
        template: '<div class="student-card-mock"></div>'
    }
}));

vi.mock('~/components/SupervisorStudentList/ValidatedMailInput.vue', () => ({
    default: {
        name: 'ValidatedMailInput',
        props: ['modelValue', 'domain', 'errorMessage', 'placeholder'],
        template: '<div class="validated-mail-input-mock"></div>'
    }
}));

vi.mock('~/components/CustomButton/CustomButton.vue', () => ({
    default: {
        name: 'CustomButton',
        props: ['leftIcon', 'text', 'color', 'size', 'variant'],
        template: '<button class="custom-button-mock"></button>'
    }
}));

describe('SupervisorStudentList', () => {
    const mockStudents = [
        {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@fhstp.ac.at',
            src: ''
        },
        {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@fhstp.ac.at',
            src: ''
        }
    ];

    it('renders with default props', () => {
        const wrapper = shallowMount(SupervisorStudentList, {
            props: {
                students: []
            }
        });
        expect(wrapper.exists()).toBe(true);
        expect(wrapper.find('.text-x-small').text()).toBe('0/12');
    });

    it('renders with custom maxStudents', () => {
        const wrapper = shallowMount(SupervisorStudentList, {
            props: {
                students: [],
                maxStudents: 20
            }
        });
        expect(wrapper.find('.text-x-small').text()).toBe('0/20');
    });

    it('renders student cards for each student', () => {
        const wrapper = shallowMount(SupervisorStudentList, {
            props: {
                students: mockStudents
            }
        });

        expect(wrapper.findAllComponents({name: 'StudentCard'}).length).toBe(2);
    });
});
