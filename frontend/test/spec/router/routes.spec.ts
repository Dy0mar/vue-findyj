import type { RouteRecordRaw } from "vue-router";
import { describe, expect, it } from "vitest";
import router from "src/router";

describe("routes", () => {
  const { routes } = router.options;

  const walk = (routes: readonly RouteRecordRaw[], cb: (route: RouteRecordRaw) => void) => {
    routes.forEach((route) => {
      cb(route);
      if (route.children) walk(route.children, cb);
    });
  };

  it("should have a path for each route", () => {
    walk(routes, (route) => {
      expect(route.path).toBeDefined();
    });
  });

  it("should have a name for each route", () => {
    walk(routes, (route) => {
      expect(route.name).toBeDefined();
    });
  });

  it("should have a component or components for each route", () => {
    walk(routes, (route) => {
      expect(route.component || route.components, `"${String(route.name || route.path)}"`).toBeDefined();
    });
  });

  it("uses dynamic imports for components", () => {
    walk(routes, (route) => {
      expect(route.component).toBeInstanceOf(Function);
    });
  });
});
