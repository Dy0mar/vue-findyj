import { beforeAll, describe, expect, it } from "vitest";
import { server, http, HttpResponse } from "test/utils/server";
import { authQuery } from "src/api/query/auth";
import { callQueryFn } from "test/utils/misc";

describe("authQuery", () => {
  const data = { message: "ok" };

  beforeAll(() => {
    server.use(
      http.get(authQuery.client.path.check(), () => {
        return HttpResponse.json(data);
      }),
    );
  });

  it("calls mutationFn should returns correct data", async () => {
    const result = await callQueryFn(authQuery.check());
    expect(result).toStrictEqual(data);
  });
});
