import type { VacancyStatus } from "src/constants";
import type { CategoryDetailOut } from "src/types/models/crawler/category";

export type VacancyStatusType = (typeof VacancyStatus)[keyof typeof VacancyStatus];

export type VacancyDetailOut = {
  id: number;
  v_id: number;
  title: string;
  description: string;
  link: string;
  date: string | null;
  company: string | null;
  salary: string | null;
  status: VacancyStatusType;
  comment: string;
  cities: string;
  status_display: string;
  read: boolean;
  category: CategoryDetailOut["name"];
};

export type VacancyIn = Partial<Omit<VacancyDetailOut, "id">>;

export type TitleStopWordIn = {
  word: string;
};

export type DescriptionStopWordIn = {
  word: string;
};
