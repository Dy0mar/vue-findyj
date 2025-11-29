import type { PartialDeep } from "type-fest";
import { assign, isFunction, merge, range } from "lodash";
import { faker } from "@faker-js/faker";
import type { Paginated } from "src/types/models/extra";

type FactoryDefaults<T> = PartialDeep<T> | ((sequence: number) => PartialDeep<T>);

/**
 * Factory class for generating test data.
 * @param T interface or type of the generated data.
 */
export class Factory<T> {
  /**
   * Will be merged with every generated object.
   */
  defaults?: FactoryDefaults<T>;
  /**
   * A sequence number for the generated data.
   */
  sequence = 0;

  /**
   * Creates an instance of Factory.
   * @param [defaults] default values for the generated data.
   * @param [fixedSeed=true] recommended to use fixed seed for storybook, or visual tests will be flaky.
   */
  constructor(defaults?: FactoryDefaults<T>, fixedSeed = false) {
    this.defaults = defaults;
    if (fixedSeed) {
      faker.seed(123);
    }
  }

  /**
   * Generates a single object.
   */
  generate(): T {
    throw new Error("Not implemented");
  }

  /**
   * Returns override values for the generated data.
   */
  getOverride(override?: FactoryDefaults<T>) {
    return isFunction(override) ? override(this.sequence) : override || ({} as Record<keyof T, undefined>);
  }

  /**
   * Returns default values for the generated data.
   */
  getDefaults() {
    return this.getOverride(this.defaults);
  }

  /**
   * Calls generate() method and deep merges the result with defaults.
   */
  create(override?: FactoryDefaults<T>, strategy: "merge" | "replace" = "merge"): T {
    this.sequence += 1;
    if (strategy === "replace") {
      return assign(this.generate(), this.getDefaults(), this.getOverride(override));
    }
    return merge(this.generate(), this.getDefaults(), this.getOverride(override));
  }

  /**
   * Generates a list of objects.
   */
  batch(count: number, override?: FactoryDefaults<T>, strategy: "merge" | "replace" = "merge"): T[] {
    return range(count).map(() => this.create(override, strategy));
  }

  /**
   * Generates a paginated list of objects.
   * Note: does not support next and previous links.
   * Note: while it is defined on base class, not every endpoint supports pagination.
   */
  paginated(count: number = 1, pages: number = 1, strategy: "merge" | "replace" = "merge"): Paginated<T> {
    return {
      count,
      items: this.batch(count, undefined, strategy),
    };
  }
}
