import { faker } from "@faker-js/faker";
import type { Category } from "src/types/models/crawler/category";
import { Factory } from "test/utils/factories/Factory";

export class CategoryFactory extends Factory<Category> {
  generate() {
    return {
      id: faker.number.int(),
      name: faker.commerce.productName(),
    };
  }
}
