# Vacancy Dashboard

[![CI Checks](https://github.com/Dy0mar/vue-findyj/actions/workflows/ci.yml/badge.svg)](https://github.com/Dy0mar/vue-findyj/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/Dy0mar/vue-findyj/badge.svg?branch=master)](https://coveralls.io/github/Dy0mar/vue-findyj?branch=master)

This is a simple personal pet project - a vacancy dashboard built with Vue 3. It allows me to manage and filter job vacancies scraped from external sources.

## ✨ Features

### 📄 Displays a list of job vacancies

### ✅ Manage vacancy status (e.g., mark as banned, interesting, etc.)

### 🔍 Filter vacancies by status

### ❌ Add stop words for title and description to auto-ban irrelevant listings

## 🛠 Tech Stack

### Frontend

- [Vue 3](https://vuejs.org/)
- [PrimeVue](https://primevue.org/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

### Backend:

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- Supabase Database (PostgreSQL)

## 🧪 Testing

This project uses [Vitest](https://vitest.dev/) for unit testing.

### Running Tests

To run the tests and generate a coverage report, navigate to the `frontend` directory and run the following command:

```bash
pnpm test:coverage
```

This will run the tests and generate a coverage report in the `frontend/coverage` directory. You can view the HTML report by opening `frontend/coverage/index.html` in your browser.

## 🧠 Why I Built This

My main goal was to deploy a full-stack app to Vercel using Edge Functions.
I wanted a simple project to explore edge-first architecture while building something useful for myself - a dashboard to track and manage job vacancies.
