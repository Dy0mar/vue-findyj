import { http } from "msw";
import { beforeAll, describe, expect, it } from "vitest";

import { HttpResponse, server } from "test/utils/server";
import { crawlerClient } from "src/api/client/crawler";
import { ParsedResultFactory } from "test/utils/factories/crawler";

describe("crawlerClient", () => {
  const data = new ParsedResultFactory().create();

  beforeAll(() => {
    server.use(
      http.get(crawlerClient.path.runParse(), () => {
        return HttpResponse.json(data);
      }),
    );
  });

  it("correct response data", async () => {
    const response = await crawlerClient.runParse();
    expect(response.data).toStrictEqual(data);
  });
});
