import { type DefaultBodyType, type StrictRequest, http } from "msw";
import { beforeAll, describe, expect, it } from "vitest";

import { HttpResponse, server } from "test/utils/server";
import { crawlerClient } from "src/api/client/crawler";
import { ParsedResultFactory } from "test/utils/factories/crawler";

describe("crawlerClient", () => {
  const data = new ParsedResultFactory().create();

  let url: undefined | URL;

  beforeAll(() => {
    server.use(
      http.get(crawlerClient.path.runParse(), ({ request }) => {
        url = new URL(request.url);
        return HttpResponse.json(data);
      }),
    );
  });

  it("correct response data", async () => {
    const response = await crawlerClient.runParse();
    expect(response.data).toStrictEqual(data);
  });

  it("correct request data", async () => {
    await crawlerClient.runParse({ data: { category: "Python" } });
    expect(url?.searchParams.get("category")).toBe("Python");
  });
});
