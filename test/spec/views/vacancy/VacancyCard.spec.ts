import type { VueWrapper } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { VacancyStatusType } from "src/types/models/vacancy/vacancy";
import { sMounter } from "test/utils/options";
import { VacancyStatus } from "src/constants";
import { getByAriaLabel } from "test/utils/selector";
import { VacancyDetailOutFactory } from "test/utils/factories/vacancy";
import VacancyCard from "src/views/vacancy/VacancyCard.vue";

type Button = {
  status: VacancyStatusType;
  label: string;
  severity: string;
};

describe("VacancyCard", () => {
  const vacancy = new VacancyDetailOutFactory({ status: VacancyStatus.INTERESTING }).create();
  const render = sMounter(VacancyCard, { props: { vacancy } });

  const getButtons = (wrapper: VueWrapper) => {
    // @ts-expect-error buttons is private
    return wrapper.vm.buttons as Button[];
  };

  it("should render the component", () => {
    const wrapper = render();
    expect(wrapper.exists()).toBe(true);
  });

  it("should has title", () => {
    const wrapper = render();
    expect(wrapper.find("h3").text()).toContain(vacancy.title);
  });

  it("should has date", () => {
    const wrapper = render();
    expect(wrapper.find("h3 ~ span").text()).toContain(vacancy.date);
  });

  it("should has cities", () => {
    const wrapper = render();
    expect(wrapper.findAll("p")[0].text()).toContain(vacancy.cities);
  });
  it("should has description", () => {
    const wrapper = render();
    expect(wrapper.findAll("p")[1].text()).toContain(vacancy.description);
  });

  it("should has last button with specific class", () => {
    const wrapper = render();
    expect(wrapper.findAll("button").at(-1)!.classes()).toContain("ml-auto");
  });

  it("buttons should not be disabled", () => {
    const wrapper = render();
    getButtons(wrapper)
      .filter(({ status }) => status !== vacancy.status)
      .forEach(({ label }) => {
        expect(getByAriaLabel(wrapper, label).attributes("disabled")).not.toBeDefined();
      });
  });

  it("should has disabled button with the same category", () => {
    const wrapper = render();
    const label = getButtons(wrapper).find(({ status }) => status === vacancy.status)!.label;
    expect(getByAriaLabel(wrapper, label).attributes("disabled")).toBeDefined();
  });

  it("should emit event from the component", async () => {
    const wrapper = render();

    const buttons = getButtons(wrapper)
      .filter(({ status }) => status !== vacancy.status)
      .entries();
    for (const [_, button] of buttons) {
      await getByAriaLabel(wrapper, button.label).trigger("click");
    }
    for (const [idx, button] of buttons) {
      expect(wrapper.emitted("change-status")![0][idx]).toStrictEqual(
        expect.objectContaining({ status: button.status }),
      );
    }
  });
});
