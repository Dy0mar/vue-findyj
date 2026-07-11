import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import type { AppContext, AppVariables, Category, Vacancy } from "./types.ts";
import { ALLOWED_ORIGINS, VacancyStatus, ALLOWED_METHODS } from "./constants.ts"
import {
  fetchCategoryByName,
  fetchStopWords,
  fetchVacanciesByCategoryId,
  getClient,
  Table
} from "./client.ts";
import { loadVacancies } from "./client.ts";
import { sleep } from "./utils/time.ts";
import { findWordsInString } from "./utils/search.ts";
import { extractJobDescription, fetchCompanyExport } from "./parser.ts";
import { supabase } from "./middleware.ts";

export const api = new Hono<{ Variables: AppVariables }>()

api.use('*', cors({
    origin: (origin) => {
      return origin && ALLOWED_ORIGINS.includes(origin) ? origin : ""
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ALLOWED_METHODS,
  })
)
api.use('*', supabase())


/** ------------ CATEGORIES ------------ */

/** List of categories */
api.get('/categories', async (c) => {
  const { data } = await getClient(c).from(Table.categories).select<string, Category>("*")
  return c.json(data ?? [], 200)
})


/** ------------ CRAWLER ------------ */

/** Add vacancies */
api.get('/crawler/run-parse', async (c) => {
  const { category } = c.req.query()
  console.log("run parse [category]", category)

  const { data: categoryObj } = await fetchCategoryByName(c, category)
  if (!categoryObj) {
    throw new HTTPException(404, { message: `category: ${category} not found` });
  }

  const result = await loadVacancies(c, categoryObj)
  return c.json(result, 200)
})


/** ------------ VACANCY ------------ */

/** List of vacancies */
api.get('/vacancies', async (c) => {
  const { status, category, offset, limit, search } = c.req.query()
  const pageLimit = parseInt(limit) || 10;
  const pageOffset = parseInt(offset) || 0;

  const client = getClient(c)
  let query;

  if (category) {
    const { data: categoryObj } = await fetchCategoryByName(c, category)
    if (!categoryObj) {
      throw new HTTPException(404, { message: `category: ${category} not found` });
    }
    query = fetchVacanciesByCategoryId(c, categoryObj.id)
  } else {
    query = client.from(Table.vacancies).select("*", { count: "exact" })
  }

  if (status) {
    query = query.eq('status', status)
  }
  if (search) {
    query = query.ilike('title', `%${search}%`)
  }
  query = query
    .range(pageOffset, pageOffset + pageLimit - 1)
    .order('read', { ascending: true })
    .order('id', { ascending: true })

  const { data, error, count } = await query
  if (error) {
    throw new HTTPException(500, { message: error.message });
  }
  return c.json({
    items: data.map((item) => ({
      ...item,
      category: item.categories?.name || null,
      categories: undefined
    })),
    count
  }, 200)
})


/** Update vacancy */
api.patch('/vacancies/:v_id', async (c) => {
  const v_id = Number(c.req.param('v_id'))
  const data = await c.req.json()

  await getClient(c)
    .from(Table.vacancies)
    .update(data)
    .eq("v_id", v_id)

  return c.json(data, 200)
})

/** Vacancy detail */
api.get('/vacancies/:v_id', async (c) => {
  const v_id = parseInt(c.req.param('v_id'))

  const { data: vacancy } = await getClient(c)
    .from(Table.vacancies)
    .select('v_id, link, full_description')
    .eq('v_id', v_id)
    .single()

  if (!vacancy?.link) {
    return c.json({ error: 'Vacancy not found' }, 404)
  }

  if (vacancy.full_description) {
    return c.json({ success: true, full_description: vacancy.full_description, badges: [] })
  }

  const company = new URL(vacancy.link).pathname.match(/companies\/([^/]+)\/vacancies/)?.[1]
  if (!company) {
    return c.json({ error: 'Cannot parse company from link' }, 400)
  }

  const items = await fetchCompanyExport(company)
  if (!items) {
    return c.json({ error: 'Failed to fetch company export from DOU' }, 502)
  }

  const match = items.find(i => i.link === vacancy.link)
  if (!match) {
    return c.json({ error: 'Vacancy not found in company export' }, 404)
  }

  await getClient(c)
    .from(Table.vacancies)
    .update({ full_description: match.description })
    .eq('v_id', v_id)

  return c.json({ success: true, full_description: match.description, badges: [] })
})

/** ------------ STOP WORDS ------------ */

/** List of description stop words */
const listStopWords = (table: "titlestopword" | "descriptionstopword") => async (c: AppContext) => {
  const { data } = await getClient(c).from(Table[table]).select('*')
  return c.json(data, 200)
}


/** Add stop word */
const addStopWord = (table: "titlestopword" | "descriptionstopword") => async (c: AppContext) => {
  const data = await c.req.json()
  await getClient(c).from(Table[table]).upsert(data)
  return c.json(data, 201)
}


/** Delete stop word */
const deleteStopWord = (table: "titlestopword" | "descriptionstopword") => async (c: AppContext) => {
  const id = Number(c.req.param('id'))
  await getClient(c).from(Table[table]).delete().eq("id", id)
  return c.body(null, 204)
}


api.get('/stop-words/title', listStopWords("titlestopword"))
api.post('/stop-words/title', addStopWord("titlestopword"))
api.delete('/stop-words/title/:id', deleteStopWord("titlestopword"))

api.get('/stop-words/description', listStopWords("descriptionstopword"))
api.post('/stop-words/description', addStopWord("descriptionstopword"))
api.delete('/stop-words/description/:id', deleteStopWord("descriptionstopword"))


/** Apply title stop word */
api.get('/stop-words/title/apply', async (c) => {
  const words = await fetchStopWords(c, "titlestopword")

  if (!words.length) {
    return c.json({ banned: 0 }, 200)
  }
  const client = getClient(c)
  const { data } = await client.from(Table.vacancies)
    .select<string, Vacancy>('v_id, title')
    .neq("status", VacancyStatus.BANNED)

  const banned = data
    ?.map(({ v_id, title }): number | false => {
      return findWordsInString(words, title) !== null ? v_id : false
    })
    .filter((value): value is number => typeof value !== "boolean");

  if (banned && banned.length > 0) {
    await client.from(Table.vacancies)
      .update({ status: VacancyStatus.BANNED })
      .in("v_id", banned)
  }
  return c.json({ banned }, 200)
})


/** Apply description stop word */
api.get('/stop-words/description/apply', async (c) => {
  const { category } = c.req.query()

  const client = getClient(c)

  let query;

  if (category) {
    const { data: categoryObj } = await fetchCategoryByName(c, category)
    if (!categoryObj) {
      throw new HTTPException(404, { message: `category: ${category} not found` });
    }
    query = fetchVacanciesByCategoryId(c, categoryObj.id)
  } else {
    query = client.from(Table.vacancies).select("*")
  }

  query = query.neq("status", VacancyStatus.BANNED)

  const { data, error } = await query
  if (error) {
    throw error
  }

  const vacancies = data

  const words = await fetchStopWords(c, "descriptionstopword")
  const bannedVacancies = []
  const removedVacancies = []

  for (const v of vacancies) {
    if (!v.link) {
      continue
    }

    const desc = await extractJobDescription(v.link)
    if (!desc && v.status !== VacancyStatus.APPLIED) {
      removedVacancies.push(v.v_id)
      continue
    }
    if (!desc) {
      continue
    }

    if (findWordsInString(words, desc.description)) {
      bannedVacancies.push(v.v_id)
    } else if (desc.salary && desc.salary !== v.salary) {
      await client.from(Table.vacancies)
        .update({ salary: desc.salary})
        .eq("id", v.v_id)
    }
    await sleep()
  }

  if (bannedVacancies.length > 0) {
    await client.from(Table.vacancies)
      .update({ status: VacancyStatus.BANNED })
      .in("v_id", bannedVacancies)
  }
  if (removedVacancies.length > 0) {
    await client.from(Table.vacancies)
      .delete()
      .in("v_id", removedVacancies)
  }

  return c.json({
    banned: bannedVacancies,
    removed: removedVacancies,
  }, 200)
})


const app = new Hono()
app.route('/api', api)

Deno.serve(app.fetch)
