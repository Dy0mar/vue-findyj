import { faker } from "@faker-js/faker";
import type { ParsedResult } from "src/types/models/crawler/category";
import { Factory } from "test/utils/factories/Factory";

export class ParsedResultFactory extends Factory<ParsedResult> {
  generate() {
    return {
      created: faker.number.int(),
      removed: faker.number.int(),
    };
  }
}
