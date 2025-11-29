import { http } from "msw";
import { beforeAll, describe, expect, it } from "vitest";

import { HttpResponse, server } from "test/utils/server";
import { categoryQuery } from "src/api/query/category";
import { CategoryFactory } from "test/utils/factories/category";
import { callQueryFn } from "test/utils/misc";

describe("categoryQuery", () => {
  const data = new CategoryFactory().batch(1);

  beforeAll(() => {
    server.use(
      http.get(categoryQuery.client.path.categoryList(), () => {
        return HttpResponse.json(data);
      }),
    );
  });

  it("correct response data", async () => {
    const result = await callQueryFn(categoryQuery.categoryList());
    expect(result).toStrictEqual(data);
  });
});
