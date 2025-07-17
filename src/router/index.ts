import { createRouter, createWebHistory } from "vue-router";
import { routes } from "src/router/routes";

export const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: "active",
  linkExactActiveClass: "exact",
});
