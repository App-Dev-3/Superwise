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
    previeText: "Hello Preview",
  };

  const globalComponents = {
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
});
