import { config } from "@vue/test-utils";
import { RequestHandler } from "msw";
import { beforeEach, beforeAll, afterEach, afterAll, vi } from "vitest";
import { VueRouterMock, createRouterMock, injectRouterMock } from "vue-router-mock";

import { VueQueryPlugin } from "@tanstack/vue-query";
import { ToastService } from "primevue";
import PrimeVue from "primevue/config";

import { bus } from "src/bus";
import { EmitterKey } from "src/symbols";
import { FTheme } from "src/themes/f-theme";
import { server } from "test/utils/server";
import { queryClient } from "src/queryClient";
import "src/prototype";

vi.stubEnv("VITE_BASE_URL", "/");

// Router for the tests.
const router = createRouterMock();

// Reset any temporary routes and query the client cache between tests.
afterEach(() => {
  router.reset();
  queryClient.clear();
});

// Inject the router mock into the global configuration.
beforeEach(() => {
  injectRouterMock(router);
});

beforeAll(() => {
  // MSW can't fail test if it receives an unhandled request, instead it yells in the console.
  // Make the yell more comprehensible.
  server.listen({
    onUnhandledRequest: (req) => {
      const requested = `${req.method} ${req.url}`;
      const handlers = server
        .listHandlers()
        .filter(function (handler) {
          // `handler.info` has the ` method ` property, but it is not present in TypeScript definition.
          return handler instanceof RequestHandler ? handler.info.header.startsWith(req.method) : false;
        })
        .map(function (handler) {
          return handler instanceof RequestHandler ? handler.info.header : "";
        });
      console.error(`Unhandled request to: ${requested}.\nAvailable handlers:\n${handlers.join("\n")}`);
    },
  });

  // Reset any temporary MSW handlers between units and close the server.
  afterAll(() => {
    server.resetHandlers();
    server.close();
  });
});

// Reset any temporary MSW handlers between units and close the server.
afterAll(() => {
  server.resetHandlers();
  server.close();
});

// Add global stubs and provide
config.global.stubs = {
  teleport: true,
};

// Add properties to the wrapper
config.plugins.VueWrapper.install(VueRouterMock);

// Add global plugins and directives
config.global.plugins = [[PrimeVue, FTheme], ToastService, [VueQueryPlugin, { queryClient }]];

config.global.provide = {
  [EmitterKey as unknown as string]: bus,
};
