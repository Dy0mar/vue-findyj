import type { Category } from "src/types/models/crawler/category";
import { VacancyStatus } from "src/constants";

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
  category: Category["name"];
};

export type VacancyIn = Partial<Omit<VacancyDetailOut, "id">>;

export type StopWord = { id: number; word: string };

export type TitleStopWord = StopWord;
export type TitleStopWordIn = Pick<TitleStopWord, "word">;

export type DescriptionStopWord = StopWord;
export type DescriptionStopWordIn = Pick<DescriptionStopWord, "word">;
