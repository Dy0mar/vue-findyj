import type { Context } from 'hono'
import { createClient } from '@supabase/supabase-js'
import type { Category, Vacancy } from "./types.ts";
import type { Database } from './database.types.ts'
import { fetchVacancies } from "./parser.ts";
import { findWordsInString } from "./utils/search.ts";
import { VacancyStatus } from "./constants.ts";


export function getClient(context?: Context) {
  return createClient<Database>(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: {
        headers: {
          Authorization: context?.req.header('authorization') ?? '',
        },
      },
    }
  )
}

export function fetchVacanciesByCategoryId(c: Context, category_id: number, field="*") {
  return getClient(c)
    .from("vacancies")
    .select<string, Vacancy>(`${field}, categories(name)`, { count: "exact" })
    .eq('category_id', category_id);
}

export function fetchCategoryByName(c: Context, category: string) {
  return getClient(c)
    .from("categories")
    .select<string, Category>("*")
    .eq("name", category)
    .single();
}

export async function fetchStopWords(c: Context, table: "titlestopword" | "descriptionstopword"): Promise<string[]> {
  const { data: rawWords } = await getClient(c).from(table).select<string, { id: number, word: string }>('word')
  return rawWords?.map(({ word }) => word) || [];
}

export async function loadVacancies(c: Context, category: Category) {
  const { data: catItems, error: vacError } = await fetchVacanciesByCategoryId(c, category.id, "v_id")
  if (vacError) {
    throw vacError
  }

  const client = getClient(c)
  const ids_ = catItems?.map(({ v_id }) => v_id) ?? []
  const allVacancies = await fetchVacancies(category.name)
  const words = await fetchStopWords(c, "titlestopword")

  const vacancies_to_create = allVacancies
    .filter(({ v_id }) => !ids_.includes(v_id))
    .map((v) => {
      let status = VacancyStatus.NEW
      if (words.length && findWordsInString(words, v.title) !== null) {
        status = VacancyStatus.BANNED
      }

      return {
        ...v,
        status,
        category_id: category.id
      }
    })

  const { error } = await client
    .from("vacancies")
    .insert(vacancies_to_create);

  if (error) {
    throw error;
  }

  const actual_vacancy_ids = allVacancies.map(({ v_id }) => v_id);
  const ids_to_remove = ids_.filter((id) => !actual_vacancy_ids.includes(id))

  if (ids_to_remove.length > 0) {
    const { error } = await client
      .from('vacancies')
      .delete()
      .in("v_id", ids_to_remove)

    if (error) {
      throw error;
    }
  }

  return {
    created: vacancies_to_create.length,
    removed: ids_to_remove.length,
  }
}
