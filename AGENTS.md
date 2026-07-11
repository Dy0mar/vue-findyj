# Findyj — Vacancy Dashboard

## Overview

Vue 3 SPA + Hono (Supabase Edge Function) для скрапінгу вакансій
Зберігає в PostgreSQL (Supabase), показує список із фільтрацією по статусу/категорії/пошуку,
стоп-словами для автобана, та статусами вакансій.

GitHub: https://github.com/Dy0mar/vue-findyj

## Tech Stack

### Frontend

| Технологія | Версія |
|---|---|
| Vue 3 (Composition API, `<script setup>`) | ^3.5.25 |
| TypeScript | ~5.8.3 |
| Vite | ^7.2.7 |
| vue-router | ^4.6.3 |
| PrimeVue | ^4.5.2 |
| TanStack Query (vue-query) | ^5.92.1 |
| Axios | ^1.13.2 |
| Tailwind CSS | ^4.1.17 |
| mitt (event bus) | ^3.0.1 |
| Supabase JS | ^2.87.1 |
| Vitest | ^3.2.4 |
| vue-tsc | ^3.1.8 |

### Backend

| Технологія | Примітка |
|---|---|
| Deno (Supabase Edge Functions) | Runtime |
| Hono | Web framework |
| Supabase PostgreSQL 17 | Database |
| @supabase/supabase-js | DB access |
| deno-dom (DOMParser) | HTML parsing |

## Project Structure

```
vue-findyj/
├── frontend/                    # Vue 3 SPA
│   └── src/
│       ├── api/
│       │   ├── client/          # Axios API клієнти
│       │   │   ├── base.ts      # BaseAPIClient, BasePath, axios instance
│       │   │   ├── vacancy.ts   # /vacancies CRUD
│       │   │   ├── crawler.ts   # /crawler/run-parse
│       │   │   ├── category.ts  # /categories
│       │   │   ├── stop-words-*.ts
│       │   │   └── supabase.ts  # Supabase client
│       │   └── query/           # TanStack Query hooks
│       ├── components/          # UI компоненти
│       │   └── settings/        # Стоп-слова (діалоги)
│       ├── hooks/               # useBus, useMessage, useRequest
│       ├── layout/              # AppLayout, AppHeader, AppFooter
│       ├── router/              # Vue Router (routes, guards, names)
│       ├── types/models/        # TypeScript типи
│       ├── views/               # Сторінки
│       │   ├── auth/            # Login
│       │   └── vacancy/         # VacancyView, VacancyList, VacancyCard
│       └── constants.ts         # VacancyStatus, DEFAULT_PAGE_SIZE
├── backend-hono/
│   └── supabase/functions/api/  # Hono Edge Function
│       ├── index.ts             # Route definitions
│       ├── client.ts            # DB helpers (CRUD, loadVacancies)
│       ├── parser.ts            # Скрапінг (fetchVacancies, extractJobDescription)
│       ├── middleware.ts        # Supabase auth middleware
│       ├── constants.ts         # VacancyStatus, SITE_URL
│       ├── types.ts             # Category, ParsedVacancy, Vacancy, StopWord
│       ├── database.types.ts    # Supabase DB types (generated)
│       ├── utils/
│       │   ├── search.ts        # findWordsInString
│       │   └── time.ts          # sleep()
│       └── tests/               # Deno tests
└── AGENTS.md
```

## Database Schema

### Tables

**vacancies** / **test_vacancies**

| Column | Type | Notes |
|---|---|---|
| id | int8 (PK) | Auto |
| v_id | int8 | External vacancy ID |
| title | text | |
| description | text | |
| link | text | URL |
| date | text | |
| company | text | |
| salary | text | |
| cities | text | |
| status | text | enum: new, interesting, not_interesting, not_suitable, banned, inactive, english, applied |
| read | bool | |
| category_id | int4 (FK → categories.id) | |
| created_at | timestamptz | |

**categories** / **test_categories**: id, name

**titlestopword** / **test_titlestopword**: id, word

**descriptionstopword** / **test_descriptionstopword**: id, word

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /categories | Yes | List categories |
| GET | /crawler/run-parse?category= | Yes | Scrape vacancies |
| GET | /vacancies?status=&category=&search=&offset=&limit= | Yes | List vacancies (paginated) |
| PATCH | /vacancies/:v_id | Yes | Update vacancy (status, read) |
| GET | /stop-words/title | Yes | List title stop words |
| POST | /stop-words/title | Yes | Add title stop word |
| DELETE | /stop-words/title/:id | Yes | Delete title stop word |
| GET | /stop-words/title/apply | Yes | Auto-ban by title |
| GET | /stop-words/description | Yes | List description stop words |
| POST | /stop-words/description | Yes | Add description stop word |
| DELETE | /stop-words/description/:id | Yes | Delete description stop word |
| GET | /stop-words/description/apply?category= | Yes | Fetch descriptions & auto-ban |

All paths prefixed with `/v1/api/` on frontend (via `BasePath`).

## Frontend Conventions

- **Composition API** + `<script setup lang="ts">`
- **No comments** in code unless absolutely necessary
- **Absolute imports** with `src/` alias
- **Named exports** for components, `export default` only for Vue SFCs
- **TanStack Query** for server state (caching, optimistic updates, infinite scroll)
- **Axios** with Supabase auth interceptor (Bearer token)
- **PrimeVue** components (Drawer, Button, etc.)
- **Tailwind CSS** for styling (no scoped CSS)
- **mitt** event bus for cross-component communication (refetch triggers, settings)
- **Route query params** for filters: `?status=new&category=python&search=...`
- **VacancyStatus** enum (duplicated in frontend and backend)

## Common Tasks

### Run frontend dev server
```bash
cd frontend && pnpm dev
```

### Run backend locally
```bash
cd backend-hono && npx supabase functions serve api --env-file supabase/functions/.env
```

### Run all checks (frontend)
```bash
cd frontend && pnpm lint:oxlint && pnpm lint:eslint && pnpm type-check && pnpm test:coverage
```

### Add new API client
1. Create client file in `frontend/src/api/client/`
2. Extend `BaseAPIClient` + create `Path` extending `BasePath`
3. Create query hooks in `frontend/src/api/query/`

### Add new backend endpoint
1. Define handler in `backend-hono/supabase/functions/api/index.ts`
2. Use `c.get('supabase')` for DB access
3. Add types if needed in `types.ts`
4. Write tests in `backend-hono/supabase/functions/api/tests/`

## Testing

- **Frontend:** Vitest + Vue Test Utils + jsdom
  - Run: `cd frontend && pnpm test:coverage`
  - Coverage in `frontend/coverage/`
- **Backend:** Deno built-in test runner
  - Run: `cd backend-hono/supabase/functions/api && deno test`
  - Uses `test_` prefixed tables in test mode
  - Test factories in `tests/test-utils/`

## Key Architectural Decisions

1. **Single Hono Edge Function** — все API endpoints в одному файлі `index.ts`
2. **Test mode** — `TEST_MODE` env var перемикає на `test_` таблиці
3. **proxy-based Table** — `Table.vacancies` автоматично додає `test_` префікс для тестів
4. **Polite scraping** — 500ms `sleep()` між запитами
5. **No reactive mobile check** — `isMobile()` викликається один раз при завантаженні (навмисно)
