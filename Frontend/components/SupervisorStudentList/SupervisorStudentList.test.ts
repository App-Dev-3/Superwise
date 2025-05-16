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

    it('toggles edit mode when edit button is clicked', async () => {
        const wrapper = shallowMount(SupervisorStudentList, {
            props: {
                students: mockStudents
            }
        });

        // Initially not in edit mode
        expect(wrapper.vm.isEditing).toBe(false);
        expect(wrapper.vm.editButtonLabel).toBe('Edit');

        // Click the edit button
        const editButton = wrapper.findComponent({name: 'CustomButton'});
        await editButton.vm.$emit('click');

        // Should be in edit mode
        expect(wrapper.vm.isEditing).toBe(true);
        expect(wrapper.vm.editButtonLabel).toBe('Done');
        expect(wrapper.vm.editButtonIcon).toBe('check');

        // Click again to exit edit mode
        await editButton.vm.$emit('click');

        // Should be back to not in edit mode
        expect(wrapper.vm.isEditing).toBe(false);
        expect(wrapper.vm.editButtonLabel).toBe('Edit');
        expect(wrapper.vm.editButtonIcon).toBe('edit');
    });

    it('emits remove:student event when removeStudent is called in edit mode', async () => {
        const wrapper = shallowMount(SupervisorStudentList, {
            props: {
                students: mockStudents
            }
        });

        // Set to edit mode first
        wrapper.vm.isEditing = true;

        // Call removeStudent method
        wrapper.vm.removeStudent('1');

        // Check that the event was emitted with the correct ID
        expect(wrapper.emitted('remove:student')).toBeTruthy();
        expect(wrapper.emitted('remove:student')[0]).toEqual(['1']);
    });

    it('does not emit remove:student event when not in edit mode', () => {
        const wrapper = shallowMount(SupervisorStudentList, {
            props: {
                students: mockStudents
            }
        });

        // Make sure we're not in edit mode
        wrapper.vm.isEditing = false;

        // Call removeStudent method
        wrapper.vm.removeStudent('1');

        // Check that no event was emitted
        expect(wrapper.emitted('remove:student')).toBeFalsy();
    });

    it('emits add:students event when addStudent is called with valid email', async () => {
        const wrapper = shallowMount(SupervisorStudentList, {
            props: {
                students: mockStudents
            }
        });

        // Set email address
        wrapper.vm.emailAddress = 'new.user';

        // Call addStudent method
        wrapper.vm.addStudent();

        // Check that the event was emitted with the correct email
        expect(wrapper.emitted('add:students')).toBeTruthy();
        expect(wrapper.emitted('add:students')[0]).toEqual(['new.user@fhstp.ac.at']);

        // Check that the email input was cleared
        expect(wrapper.vm.emailAddress).toBe('');
    });

    it('does not emit add:students event when email is empty', () => {
        const wrapper = shallowMount(SupervisorStudentList, {
            props: {
                students: mockStudents
            }
        });

        // Set empty email address
        wrapper.vm.emailAddress = '';

        // Call addStudent method
        wrapper.vm.addStudent();

        // Check that no event was emitted
        expect(wrapper.emitted('add:students')).toBeFalsy();
    });
});
