import { Context } from "hono";
import { VacancyStatus } from "./constants.ts";
import type { SupabaseClient } from '@supabase/supabase-js'
import { Database } from "./database.types.ts";

export type Category = {
  id: number;
  name: string;
}

export type ParsedVacancy = {
  v_id: number;
  link: string;
  date: string;
  title: string;
  company: string;
  cities: string;
  description: string;
}

export type Vacancy = {
  id: number;
  created_at: string
  read: boolean;
  status: VacancyStatus
  category_id: Category["id"]
  salary: string;
} & ParsedVacancy


export type AppVariables = {
  supabase: SupabaseClient<Database, "public">
};

export type AppContext = Context<{ Variables: AppVariables }>
