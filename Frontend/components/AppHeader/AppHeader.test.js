import {mount, shallowMount} from "@vue/test-utils";
import {describe, expect, it, vi} from "vitest";
import AppHeader from "./AppHeader.vue";
import {getI18n} from '../../test-utils'

const mockBack = vi.fn();

vi.mock("#imports", () => ({
    useColorMode: () => ({
        preference: "light",
        value: "light",
    }),
}));

//mock the router
vi.mock("vue-router", () => ({
    useRouter: () => ({
        back: mockBack,
    }),
}));

// Basic stub for InputField
const InputFieldStub = {
    template:
        "<input @blur=\"$emit('blur')\" @input=\"$emit('update:modelValue', $event.target.value)\" />",
    props: ["modelValue"],
};

const FontAwesomeIconStub = {
    name: "FontAwesomeIcon",
    inheritAttrs: false,
    props: ["icon"],
    template: '<button v-bind="$attrs"></button>',
};

const SearchBarStub = {
    name: "SearchBar",
    inheritAttrs: false,
    props: ["rightIcon", "placeholder", "modelValue"],
    emits: ["update:modelValue"],
    template: `
      <div>
        <button data-test="search-button" @click="$emit('update:modelValue', 'hello')"></button>
      </div>
    `,
};

describe("AppHeader.vue", () => {
    const globalConfig = {
        stubs: {
            InputField: InputFieldStub,
            FontAwesomeIcon: FontAwesomeIconStub,
            SearchBar: SearchBarStub,
            SideDrawer: true,
            AppThemeToggle: true,
            ClientOnly: true,
            UserButton: true,
        },
        plugins: [getI18n()]
    };

    it("renders the SearchBar when showSearch is true", () => {
        const wrapper = shallowMount(AppHeader, {
            props: {showSearch: true, image: '', firstName: '', lastName: ''},
            global: globalConfig
        });
        expect(wrapper.findComponent(SearchBarStub).exists()).toBe(false);
    });

    it("goes back when the back button is clicked", async () => {
        const wrapper = mount(AppHeader, {
            props: {showBack: true, firstName: "Testus", lastName: "Tester", image: ''},
            global: globalConfig
        });

        await wrapper.find('[data-test="back-button"]').trigger("click");
        expect(mockBack).toHaveBeenCalled();
    });
});
