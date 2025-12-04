import { faker } from "jsr:@jackfiszr/faker@1.1.6";
import { Category } from "../../api/types.ts";
import { Factory } from "./Factory.ts";


export class CategoryFactory extends Factory<Omit<Category, "id">> {
  override getTableName() {
    return "categories"
  }

  override generate() {
    return {
      name: faker.commerce.productName(),
    };
  }
}
