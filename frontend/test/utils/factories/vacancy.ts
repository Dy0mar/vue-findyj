import { faker } from "@faker-js/faker";
import type { VacancyDetailOut, VacancyStatusType } from "src/types/models/vacancy/vacancy";
import { Factory } from "test/utils/factories/Factory";
import { VacancyStatus } from "src/constants";

export class VacancyDetailOutFactory extends Factory<VacancyDetailOut> {
  generate() {
    return {
      id: faker.number.int(),
      v_id: faker.number.int(),
      title: faker.person.jobTitle(),
      description: faker.lorem.paragraphs(3),
      link: faker.internet.url(),
      date: faker.date.recent().toISOString(),
      company: faker.company.name(),
      salary: faker.finance.amount({ min: 50000, max: 200000, dec: 0, symbol: "$" }),
      status: faker.helpers.arrayElement<VacancyStatusType>(Object.values(VacancyStatus)),
      comment: faker.lorem.sentence(),
      cities: faker.location.city(),
      status_display: faker.helpers.arrayElement(Object.values(VacancyStatus).map((s) => s.toLowerCase())),
      read: faker.datatype.boolean(),
      category: faker.person.jobType(),
    };
  }
}
