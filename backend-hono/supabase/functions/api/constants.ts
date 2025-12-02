export const ALLOWED_ORIGINS = Deno.env.get("ALLOWED_ORIGINS").split(",")

/** PARSER */
export const SITE_URL = Deno.env.get("SITE_URL")


export enum VacancyStatus {
  NEW = "new",
  INTERESTING = "interesting",
  NOT_INTERESTING = "not_interesting",
  NOT_SUITABLE = "not_suitable",
  BANNED = "banned",
  INACTIVE = "inactive",
  ENGLISH = "english",
  APPLIED = "applied",
}

