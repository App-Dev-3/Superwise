import {beforeEach, describe, expect, it, vi} from "vitest";
import {mount} from "@vue/test-utils";
import {useColorMode} from "#imports";
import SideDrawer from "./SideDrawer.mock.vue"; // Use mock component without i18n dependencies

vi.mock("#imports", () => {
    return {
        useColorMode: vi.fn(),
    };
});

describe("SideDrawer.vue", () => {
    beforeEach(() => {
        useColorMode.mockReset();
    });

    // stub out NuxtLink, FontAwesomeIcon & SignOutButton
    it("renders the explicit image when `image` prop is non-empty", () => {
        const placeholderMock = vi.fn();
        const wrapper = mount(SideDrawer, {
            props: {
                image: "https://example.com/me.png",
                firstName: "John",
                lastName: "Doe",
            },
            global: {
                stubs: ["NuxtLink", "FontAwesomeIcon", "SignOutButton"],
                mocks: {getPlaceholderImage: placeholderMock},
            },
        });

        const img = wrapper.find(".avatar img");
        expect(img.exists()).toBe(true);
        expect(img.attributes("src")).toBe("https://example.com/me.png");
        expect(placeholderMock).not.toHaveBeenCalled();
    });

    it("falls back to getPlaceholderImage when `image` is empty", () => {
        const placeholderMock = vi.fn(() => "fallback.png");
        const wrapper = mount(SideDrawer, {
            props: {image: "", firstName: "Jane", lastName: "Smith"},
            global: {
                stubs: ["NuxtLink", "FontAwesomeIcon", "SignOutButton"],
                mocks: {getPlaceholderImage: placeholderMock},
            },
        });

        expect(placeholderMock).toHaveBeenCalledWith("Jane", "Smith");
        expect(wrapper.find(".avatar img").attributes("src")).toBe("fallback.png");
    });

    it('shows dark-mode logo when colorMode.value === "dark"', () => {
        useColorMode.mockReturnValue({value: "dark"});
        const wrapper = mount(SideDrawer, {
            props: {image: "", firstName: "X", lastName: "Y"},
            global: {
                stubs: ["NuxtLink", "FontAwesomeIcon", "SignOutButton"],
                mocks: {getPlaceholderImage: () => ""},
            },
        });
        const logo = wrapper.find('img[alt="Logo"]');
        expect(logo.attributes("src")).toMatch(/appHeader_logo_dark\.svg$/);
    });

    it('shows light-mode logo when colorMode.value === "light"', () => {
        useColorMode.mockReturnValue({value: "light"});
        const wrapper = mount(SideDrawer, {
            props: {image: "", firstName: "X", lastName: "Y"},
            global: {
                stubs: ["NuxtLink", "FontAwesomeIcon", "SignOutButton"],
                mocks: {getPlaceholderImage: () => ""},
            },
        });
        const logo = wrapper.find('img[alt="Logo"]');
        expect(logo.attributes("src")).toMatch(/appHeader_logo_light\.svg$/);
    });
});
