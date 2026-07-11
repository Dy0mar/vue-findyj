alter table "public"."vacancies"
  add column "badges" text[] not null default '{}';

alter table "public"."vacancies"
  add column "full_description" text not null default '';
