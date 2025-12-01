import { getRouter } from "vue-router-mock";
import { describe, expect, it } from "vitest";
import { sMounter } from "test/utils/options";
import { VacancyStatus } from "src/constants";
import VacancyView from "src/views/vacancy/VacancyView.vue";


describe("VacancyView", () => {

  const render = sMounter(VacancyView, { global: { stubs: { VacancyList: true } } })

  it("should render the component", () => {
    const wrapper = render();
    expect(wrapper.exists()).toBe(true);
  });

  it("the list should be hidden when category is not provided", () => {
    const wrapper = render();
    expect(wrapper.findComponent({ name: "VacancyList" }).exists()).toBe(false);
  });

  it("iframe should be hidden", () => {
    const wrapper = render();
    expect(wrapper.find('iframe').exists()).toBe(false);
  });

  it("has the list when category is provided", async () => {
    const router = getRouter()
    await router.setQuery({ category: 'Python' })
    const wrapper = render();
    expect(wrapper.findComponent({ name: "VacancyList" }).exists()).toBe(true);
  });

  it.each([ 'foo', ['foo', 'bar'] ])("should pass correct search prop", async (search) => {
    const router = getRouter()
    await router.setQuery({ category: 'Python', search })
    const wrapper = render();
    expect(wrapper.findComponent({ name: "VacancyList" }).props('search')).toBe("foo");
  });

  it("should pass correct src prop to iframe", async () => {
    const router = getRouter()
    await router.setQuery({ category: 'Python' })
    const wrapper = render();
    wrapper.findComponent({ name: "VacancyList" }).vm.$emit('selected', { link: 'https://foo.bar' })
    await wrapper.vm.$nextTick();
    expect(wrapper.find('iframe').attributes('src')).toBe('https://foo.bar');
  });

  it("should pass correct status to the list component", async () => {
    const router = getRouter()
    await router.setQuery({ category: 'Python', status: VacancyStatus.APPLIED })

    const wrapper = render();
    expect(wrapper.findComponent({ name: "VacancyList" }).props('status')).toBe(VacancyStatus.APPLIED);
  });

  it("should pass default status to the list component when status is wrong", async () => {
    const router = getRouter()
    await router.setQuery({ category: 'Python', status: "foo" })
    const wrapper = render();
    expect(wrapper.findComponent({ name: "VacancyList" }).props('status')).toBe(VacancyStatus.NEW);
  });

});
