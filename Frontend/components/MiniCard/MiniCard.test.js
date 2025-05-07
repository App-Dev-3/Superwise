import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import MiniCard from "./MiniCard.vue";
import CustomTag from "../CustomTag/CustomTag.vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUserGroup, faHourglass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faUserGroup, faHourglass);

describe("MiniCard", () => {
  const defaultProps = {
    image: "test-image.jpg",
    firstName: "John",
    lastName: "Doe",
    previewText: "Hello Preview",
  };

  const globalComponents = {
    CustomTag,
    FontAwesomeIcon,
  };

  it("renders correctly with required props", () => {
    const wrapper = mount(MiniCard, {
      props: defaultProps,
      global: {
        components: globalComponents,
      },
    });

    expect(wrapper.find("img").attributes("src")).toBe(defaultProps.image);
    expect(wrapper.text()).toContain(defaultProps.firstName);
    expect(wrapper.text()).toContain(defaultProps.lastName);
  });

  it("displays optional topText when provided", () => {
    const topText = "This is a test topText";
    const wrapper = mount(MiniCard, {
      props: {
        ...defaultProps,
        topText,
      },
      global: {
        components: globalComponents,
      },
    });

    expect(wrapper.text()).toContain(topText);
  });

  it("displays optional topText with icon when provided", () => {
    const topText = "This is a test topText";
    const topIcon = "hourglass";

    const wrapper = mount(MiniCard, {
      props: {
        ...defaultProps,
        topText,
        topIcon,
      },
      global: {
        components: globalComponents,
      },
    });

    const icon = wrapper.findComponent(FontAwesomeIcon);
    expect(icon.exists()).toBe(true);
    expect(topIcon).toBe("hourglass");
  });

  it("displays optional bottomText when provided", () => {
    const bottomText = "This is a test bottomText";
    const wrapper = mount(MiniCard, {
      props: {
        ...defaultProps,
        bottomText,
      },
      global: {
        components: globalComponents,
      },
    });

    expect(wrapper.text()).toContain(bottomText);
  });

  it("displays optional bottomText with icon when provided", () => {
    const bottomText = "This is a test bottomText";
    const bottomIcon = "user-group";

    const wrapper = mount(MiniCard, {
      props: {
        ...defaultProps,
        bottomText,
        bottomIcon,
      },
      global: {
        components: globalComponents,
      },
    });

    const icon = wrapper.findComponent(FontAwesomeIcon);
    expect(icon.exists()).toBe(true);
    expect(bottomIcon).toBe("user-group");
  });
});
