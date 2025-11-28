import { type SetupServer, setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const server: SetupServer = setupServer(
  // "Essential" endpoints as an example.
  // You can add global endpoints here, or temporary endpoints in tests using:
  //  server.use(rest.get(...));
  // Note: you can override global endpoints in tests too: https://mswjs.io/docs/api/setup-server/use#examples
  http.get("/api/healthy/", () => {
    return HttpResponse.json({ error: false });
  }),
  http.get("/api/unhealthy/", () => {
    return HttpResponse.json({ error: true });
  }),
);

// Convenience exports.
export { http, HttpResponse } from "msw";
