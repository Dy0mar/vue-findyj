import { createRouter, createWebHistory } from "vue-router";
import { routes } from "src/router/routes";
import { before } from "src/router/guards";

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: "active",
  linkExactActiveClass: "exact",
});

before.forEach((guard) => router.beforeEach(guard));

export default router;
