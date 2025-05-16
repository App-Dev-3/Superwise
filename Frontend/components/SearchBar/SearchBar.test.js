import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
import { mount } from "@vue/test-utils";
import SearchBar from "./SearchBar.vue";

const mockApi = {
  getUserByEmail: vi
    .fn()
    .mockResolvedValue({ id: 1, first_name: "Foo", last_name: "Bar" }),
  getUserByFirstName: vi.fn().mockResolvedValue([]),
  getUserByLastName: vi.fn().mockResolvedValue([]),
};

describe("SearchBar.vue", () => {
  beforeAll(() => {
    globalThis.useUserApi = () => mockApi;
  });

  afterAll(() => {
    delete globalThis.useUserApi;
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const globalStubs = {
    FontAwesomeIcon: true,
    NuxtLink: true,
  };

  const globalConfig = {
    config: {
      errorHandler: () => {},
    },
  };

  it("renders placeholder from props", () => {
    const wrapper = mount(SearchBar, {
      props: { placeholder: "Search here" },
      global: { stubs: globalStubs, ...globalConfig },
    });
    const input = wrapper.find("input");
    expect(input.attributes("placeholder")).toBe("Search here");
  });

  it("expands on click", async () => {
    const wrapper = mount(SearchBar, {
      props: { placeholder: "Search" },
      global: { stubs: globalStubs, ...globalConfig },
      attachTo: document.body,
    });
    const searchWrapper = wrapper.find(".search-wrapper");
    await searchWrapper.trigger("click");
    expect(searchWrapper.classes()).toContain("expanded");
  });

  it("shows clear icon when rightIcon prop is set after focus", async () => {
    const wrapper = mount(SearchBar, {
      props: { rightIcon: "fa-solid fa-times", placeholder: "Search" },
      global: { stubs: globalStubs, ...globalConfig },
      attachTo: document.body,
    });
    const input = wrapper.find("input");
    await input.trigger("focus");
    expect(wrapper.find(".clear-icon").exists()).toBe(true);
  });

  it("emits update:modelValue after debounce on input", async () => {
    const wrapper = mount(SearchBar, {
      props: { placeholder: "Search" },
      global: { stubs: globalStubs, ...globalConfig },
    });
    const input = wrapper.find("input");
    await input.setValue("Test");
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
    vi.advanceTimersByTime(300);
    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")[0]).toEqual(["Test"]);
  });

  it("clears input when clear icon is clicked and emits empty value", async () => {
    const wrapper = mount(SearchBar, {
      props: { rightIcon: "fa-solid fa-times" },
      global: { stubs: globalStubs, ...globalConfig },
      attachTo: document.body,
    });
    const input = wrapper.find("input");

    await input.setValue("Test");
    await input.trigger("focus");

    const clearIcon = wrapper.find(".clear-icon");
    await clearIcon.trigger("click");
    expect(input.element.value).toBe("");

    vi.advanceTimersByTime(300);
    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")[0]).toEqual([""]);
  });
});
