import { HTTPException } from 'hono/http-exception'
import { DOMParser, Element } from "deno-dom";
import type { ParsedVacancy } from "./types.ts";
import { SITE_URL } from "./constants.ts";
import { sleep } from "./utils.ts";

const BASE_URL = SITE_URL

const request_url = (category: string) => {
  const ajax = "xhr-load/?category=" + category
  return SITE_URL.endsWith('/') ? SITE_URL + ajax : SITE_URL + "/" + ajax
}


function makeHeaders(referer?: string) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.47 Safari/537.36",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  }
  return referer ? { ...headers, Referer: referer } : headers;
}


function extractJobInfo(li: Element): ParsedVacancy {
  // Link
  const linkEl = li.querySelector('div.title > a.vt');
  const link = linkEl?.getAttribute("href")?.split("?")[0] ?? "";
  const jobId = parseInt(new URL(link, "https://dummy.host").pathname.split("/").filter(Boolean).pop() || "0");

  // Date
  const date = li.querySelector("div.date")?.textContent.trim() ?? "";

  // Title
  const title = linkEl?.textContent.trim() ?? "";

  // Company
  const companyEl = li.querySelector("a.company");
  const company = companyEl?.textContent.trim() ?? "";

  // Cities
  const citiesEl = li.querySelector("span.cities");
  const cities = citiesEl?.textContent.trim() ?? "";

  // Description
  const descEl = li.querySelector("div.sh-info");
  const description = descEl
    ? descEl.textContent.replace(/\s+/g, " ").trim()
    : "";

  return {
    v_id: jobId,
    link,
    date,
    title,
    company,
    cities,
    description,
  };
}


export async function fetchVacancies(category: string): Promise<ParsedVacancy[]> {
  const headers = makeHeaders(BASE_URL)

  const baseResp = await fetch(BASE_URL, {
    headers,
    redirect: "manual",
  });

  const cookie = baseResp.headers.get("set-cookie") || "";
  const csrfMatch = cookie.match(/csrftoken=([^;]+)/);
  const csrf = csrfMatch?.[1] ?? "";

  let count = 0;
  const vacancies: ParsedVacancy[] = [];

  const url = request_url(category)

  let i = 0
  const fallbackCountCycle = 100
  while (true) {
    i = i + 1
    if (i >= fallbackCountCycle) {
      break
    }

    const formData = new URLSearchParams();
    formData.append("csrfmiddlewaretoken", csrf);
    formData.append("count", count.toString());

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Cookie": cookie,
        "X-CSRFToken": csrf,
      },

      body: formData.toString(),
    });

    if (!resp.ok) {
      throw new HTTPException(500, { message: resp.statusText });
    }
    const json = await resp.json();
    count += json.num;

    const dom = new DOMParser().parseFromString(json.html, "text/html");
    if (!dom) {
      throw new HTTPException(500, { message: "Parse error: dom not found" });
    }

    const items = dom.querySelectorAll("li.l-vacancy");

    for (const el of items) {
      vacancies.push(extractJobInfo(el));
    }

    if (json.last) {
      break;
    }

    await sleep();
  }
  return vacancies
}

type DescriptionResponseDict = {
  description: string;
  salary: string | null;
};

export async function extractJobDescription(link: string): Promise<DescriptionResponseDict | null> {
  const headers = makeHeaders();

  const response = await fetch(link, { headers });
  const html = await response.text();

  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc) return null;

  const inactive = doc.querySelector(".l-vacancy.__inactive");
  if (inactive) {
    return null;
  }

  const section = doc.querySelector(".vacancy-section");
  if (!section) {
    return null;
  }

  const description = section.textContent.trim().toLowerCase();

  const salaryEl = doc.querySelector("span.salary");
  const salary = salaryEl ? salaryEl.textContent.trim() : null;

  return { description, salary };
}
