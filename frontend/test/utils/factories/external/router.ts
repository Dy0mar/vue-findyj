import type { RouteLocationNormalized } from "vue-router";
import { faker } from "@faker-js/faker";
import { Factory } from "test/utils/factories/Factory";

export class RouteLocationNormalizedFactory extends Factory<RouteLocationNormalized> {
  /**
   * Creates RouteLocationNormalized object.
   */
  generate() {
    return {
      name: faker.lorem.sentence(),
      path: faker.lorem.sentence(),
      params: {},
      query: {},
      hash: "",
      fullPath: faker.lorem.sentence(),
      matched: [],
      meta: {},
      redirectedFrom: undefined,
    };
  }
}
