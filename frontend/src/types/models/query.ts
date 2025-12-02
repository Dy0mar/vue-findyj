import type { PaginationQuery } from "src/types/models/extra";
import type { VacancyDetailOut } from "src/types/models/vacancy/vacancy";

export type VacancyListQuery = PaginationQuery & Partial<Pick<VacancyDetailOut, "status" | "category">>;
