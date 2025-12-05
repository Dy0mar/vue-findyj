import { http } from "msw";
import { beforeAll, describe, expect, it } from "vitest";

import { HttpResponse, server } from "test/utils/server";
import { stopWordsDescriptionClient } from "src/api/client/stop-words-description";
import { StopWordFactory } from "test/utils/factories/vacancy";

describe("stopWordsDescriptionClient", () => {
  const client = stopWordsDescriptionClient;
  const stopWords = new StopWordFactory().batch(1);

  beforeAll(() => {
    server.use(
      http.get(client.path.list(), () => {
        return HttpResponse.json(stopWords);
      }),
      http.post(client.path.list(), () => {
        return HttpResponse.json(undefined, { status: 201 });
      }),
      http.delete(client.path.detail({ id: 0 }), () => {
        return HttpResponse.json(undefined, { status: 204 });
      }),
      http.get(client.path.apply(), () => {
        return HttpResponse.json(undefined);
      }),
    );
  });

  it("should return the data", async () => {
    const response = await client.list();
    expect(response.data).toStrictEqual(stopWords);
  });

  it("correct add title stop word", async () => {
    const response = await client.create({ data: { word: "stop" } });
    expect(response.status).toBe(201);
  });

  it("correct apply stop word", async () => {
    const response = await client.apply();
    expect(response.status).toBe(200);
  });

  it("correct apply stop word with query", async () => {
    const response = await client.apply({ data: { category: "foo" } });
    expect(response.status).toBe(200);
  });

  it("correct remove stop word", async () => {
    const response = await client.delete({ params: { id: 0 } });
    expect(response.status).toBe(204);
  });
});
