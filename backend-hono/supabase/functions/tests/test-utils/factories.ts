import { faker } from "@jackfiszr/faker@1.1.6";
import { Category, StopWord } from "../../api/types.ts";
import { Factory } from "./Factory.ts";


export class CategoryFactory extends Factory<Omit<Category, "id">> {
  override getTableName() {
    return "categories" as const
  }

  override generate() {
    return {
      name: faker.commerce.productName(),
    };
  }
}


export class TitleStopWordFactory extends Factory<Omit<StopWord, "id">> {
  override getTableName() {
    return "titlestopword" as const
  }

  override generate() {
    return {
      word: faker.lorem.word(),
    };
  }
}

export class DescriptionStopWordFactory extends Factory<Omit<StopWord, "id">> {
  override getTableName() {
    return "descriptionstopword" as const
  }

  override generate() {
    return {
      word: faker.lorem.words(2),
    };
  }
}
