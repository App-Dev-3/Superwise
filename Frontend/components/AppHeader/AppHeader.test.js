import { shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import AppHeader from "./AppHeader.vue";

vi.mock("#imports", () => ({
  useColorMode: () => ({ preference: "light", value: "light" }),
}));

const mockBack = vi.fn();
vi.mock("vue-router", () => ({ useRouter: () => ({ back: mockBack }) }));

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
    global: {
      stubs: {
        FontAwesomeIcon: FontAwesomeIconStub,
        UserButton: true,
        AppThemeToggle: true,
        ClientOnly: true,
        SearchBar: SearchBarStub,
      },
    },
  };

  it("renders the SearchBar when showSearch is true", () => {
    const wrapper = shallowMount(AppHeader, {
      ...globalConfig,
      props: { showSearch: true },
    });
    expect(wrapper.findComponent(SearchBarStub).exists()).toBe(true);
  });

  it("goes back when the back button is clicked", async () => {
    const wrapper = shallowMount(AppHeader, {
      ...globalConfig,
      props: { showBack: true },
    });
    await wrapper.find('[data-test="back-button"]').trigger("click");
    expect(mockBack).toHaveBeenCalled();
  });
});
