import { http } from "msw";
import { beforeAll, describe, expect, it } from "vitest";

import { HttpResponse, server } from "test/utils/server";
import { categoryClient } from "src/api/client/category";
import { CategoryFactory } from "test/utils/factories/category";

describe("categoryClient", () => {
  const data = new CategoryFactory().batch(1);

  beforeAll(() => {
    server.use(
      http.get(categoryClient.path.categoryList(), () => {
        return HttpResponse.json(data);
      }),
    );
  });

  it("correct response data", async () => {
    const response = await categoryClient.categoryList();
    expect(response.data).toStrictEqual(data);
  });
});
