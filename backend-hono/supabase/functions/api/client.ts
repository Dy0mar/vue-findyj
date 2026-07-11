import type { AppContext, Category, Vacancy } from "./types.ts";
import type { ProductionTables } from "./database.types.ts";
import { fetchVacancies, extractVacancyDetails } from "./parser.ts";
import { findWordsInString } from "./utils/search.ts";
import { sleep } from "./utils/time.ts";
import { VacancyStatus } from "./constants.ts";

export function getClient(c: AppContext) {
  return c.get('supabase')
}

type TableNameMap = {
  [K in ProductionTables]: K
};

export const Table = new Proxy({} as TableNameMap, {
  get: (_target, prop: string) => {
    return Deno.env.get("TEST_MODE") ? `test_${prop}` as const : prop
  },
});

export function fetchVacanciesByCategoryId(c: AppContext, category_id: number, field="*") {
  return getClient(c)
    .from(Table.vacancies)
    .select<string, Vacancy>(`${field}, categories(name)`, { count: "exact" })
    .eq('category_id', category_id);
}

export function fetchCategoryByName(c: AppContext, category: string) {
  return getClient(c)
    .from(Table.categories)
    .select<string, Category>("*")
    .eq("name", category)
    .single();
}

export async function fetchStopWords(c: AppContext, table: "titlestopword" | "descriptionstopword"): Promise<string[]> {
  const { data: rawWords } = await getClient(c)
    .from(Table[table])
    .select<string, { id: number, word: string }>('word')
  return rawWords?.map(({ word }) => word) || [];
}

export async function loadVacancies(c: AppContext, category: Category) {
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
    .from(Table.vacancies)
    .insert(vacancies_to_create);

  if (error) {
    throw error;
  }

  const actual_vacancy_ids = allVacancies.map(({ v_id }) => v_id);
  const ids_to_remove = ids_.filter((id) => !actual_vacancy_ids.includes(id))

  if (ids_to_remove.length > 0) {
    const { error } = await client
      .from(Table.vacancies)
      .delete()
      .in("v_id", ids_to_remove)

    if (error) {
      throw error;
    }
  }

  // vacancy - update full description and badges
  const { data: emptyDescriptions } = await client
    .from(Table.vacancies)
    .select('v_id, link')
    .eq('category_id', category.id)
    .eq('full_description', '')

  if (emptyDescriptions) {
    const descWords = await fetchStopWords(c, "descriptionstopword")

    for (const v of emptyDescriptions) {
      if (!v.link) continue

      const details = await extractVacancyDetails(v.link)
      if (details) {
        const update: Record<string, unknown> = {
          full_description: details.full_description,
          badges: details.badges,
        }
        if (descWords.length && findWordsInString(descWords, details.full_description) !== null) {
          update.status = VacancyStatus.BANNED
        }
        await client.from(Table.vacancies).update(update).eq('v_id', v.v_id)
      }

      await sleep(500 + Math.random() * 1500)
    }
  }

  return {
    created: vacancies_to_create.length,
    removed: ids_to_remove.length,
  }
}
