import { Names } from "src/router/names";

export const routes = [
  {
    path: "/",
    name: Names.HOME.INDEX,
    /* c8 ignore next */
    component: () => import("src/layout/AppLayout.vue"),
    redirect: { name: Names.VACANCY.INDEX },
    children: [
      {
        path: "/vacancies",
        name: Names.VACANCY.INDEX,
        /* c8 ignore next */
        component: () => import("src/views/vacancy/VacancyView.vue"),
      },
    ],
  },
  {
    path: "/auth",
    name: Names.AUTH.INDEX,
    /* c8 ignore next */
    component: () => import("src/views/auth/AuthView.vue"),
    redirect: { name: Names.AUTH.LOGIN },
    children: [
      {
        path: "login",
        name: Names.AUTH.LOGIN,
        /* c8 ignore next */
        component: () => import("src/views/auth/LoginView.vue"),
      },
    ],
  },
];
