import { type Context, Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import type { Category, Vacancy } from "./types.ts";
import { ALLOWED_ORIGINS, VacancyStatus } from "./constants.ts"
import {
  fetchCategoryByName,
  fetchStopWords,
  fetchVacanciesByCategoryId,
  getClient
} from "./client.ts";
import { loadVacancies } from "./client.ts";
import { sleep } from "./utils/time.ts";
import { findWordsInString } from "./utils/search.ts";
import { extractJobDescription } from "./parser.ts";

const api = new Hono()

api.use('*', cors({
    origin: (origin) => {
      return origin && ALLOWED_ORIGINS.includes(origin) ? origin : ""
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'PATCH', 'PUT', 'GET', 'OPTIONS'],
  })
)


/** ------------ AUTH ------------ */

api.get('/auth/check', (c: Context) => {
  return c.json({ message: "ok" }, 200)
})


/** ------------ CATEGORIES ------------ */

/** List of categories */
api.get('/categories', async (c: Context) => {
  const { data } = await getClient(c).from("categories").select<string, Category>()
  return c.json(data ?? [], 200)
})

/** ------------ CRAWLER ------------ */

/** Add vacancies */
api.get('/crawler/run-parse', async (c: Context) => {
  const { category } = c.req.query()

  const { data: categoryObj } = await fetchCategoryByName(c, category)
  if (!categoryObj) {
    throw new HTTPException(404, { message: `category: ${category} not found` });
  }

  const result = await loadVacancies(c, categoryObj)
  return c.json(result, 200)
})


/** ------------ VACANCY ------------ */

/** List of vacancies */
api.get('/vacancy', async (c: Context) => {
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
    query = client.from("vacancies").select("*", { count: "exact" })
  }

  if (status) {
    query = query.eq('status', status)
  }
  if (search) {
    query = query.ilike('title', `%${search}%`)
  }
  query = query.range(pageOffset, pageOffset + pageLimit - 1).order('v_id', { ascending: true })

  const { data: items, error, count } = await query
  if (error) {
    throw new HTTPException(500, { message: error.message });
  }
  return c.json({ items, count }, 200)
})


/** Update vacancy */
api.patch('/vacancy/:v_id', async (c: Context) => {
  const v_id = Number(c.req.param('v_id'))
  const data = await c.req.json()

  await getClient(c).from("vacancies")
    .update(data)
    .eq("v_id", v_id)

  return c.json(data, 200)
})


/** Apply title stop word */
api.get('/vacancy/apply-title-stop-word', async (c: Context) => {
  const words = await fetchStopWords(c, "titlestopword")

  if (!words.length) {
    return c.json({ banned: 0 }, 200)
  }
  const client = getClient(c)
  const { data } = await client.from("vacancies")
    .select<string, Vacancy>('v_id, title')
    .neq("status", VacancyStatus.BANNED)

  const banned = data
    ?.map(({ v_id, title }): number | false => {
      return findWordsInString(words, title) !== null ? v_id : false
    })
    .filter((value): value is number => typeof value !== "boolean");

  if (banned && banned.length > 0) {
    await client.from("vacancies")
      .update({ status: VacancyStatus.BANNED })
      .in("v_id", banned)
  }
  return c.json({ banned }, 200)
})

/** Add title stop word */
api.post('/vacancy/title-stop-word', async (c: Context) => {
  const data = await c.req.json()
  await getClient(c).from("titlestopword").upsert(data)
  return c.json(data, 200)
})


/** Add description stop word */
api.post('/vacancy/description-stop-word', async (c: Context) => {
  const data = await c.req.json()
  await getClient(c).from("descriptionstopword").upsert(data)
  return c.json(data, 200)
})

/** Apply description stop word */
api.get('/vacancy/apply-description-stop-word', async (c: Context) => {
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
    query = client.from("vacancies").select("*")
  }

  query = query.neq("status", VacancyStatus.BANNED)

  const { data, error } = await query
  if (error) {
    throw error
  }

  const vacancies: Vacancy[] = data ?? []

  const words = await fetchStopWords(c, "descriptionstopword")
  const bannedVacancies = []
  const removedVacancies = []

  for (const v of vacancies) {
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
      await client.from("vacancies")
        .update({ salary: desc.salary})
        .eq("id", v.v_id)
    }
    await sleep()
  }

  if (bannedVacancies.length > 0) {
    await client.from("vacancies")
      .update({ status: VacancyStatus.BANNED })
      .in("v_id", bannedVacancies)
  }
  if (removedVacancies.length > 0) {
    await client.from("vacancies")
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

export const myApp = app
Deno.serve(app.fetch)

