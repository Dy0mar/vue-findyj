import { http } from "msw";
import { ref, unref } from "vue";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { HttpResponse, server } from "test/utils/server";
import { callQueryFn } from "test/utils/misc";
import { StopWordFactory } from "test/utils/factories/vacancy";
import { queryClient } from "src/queryClient";
import { stopWordsTitleQuery } from "src/api/query/stop-words-title";
import { stopWordsDescriptionQuery } from "src/api/query/stop-words-description";

describe("stopWordsQuery", () => {
  const titleQuery = stopWordsTitleQuery;
  const descQuery = stopWordsDescriptionQuery;

  const stopWords = new StopWordFactory().batch(1);

  const cases = [
    { query: titleQuery, name: "stopWordsTitleQuery" },
    { query: descQuery, name: "stopWordsDescriptionQuery" },
  ];
  beforeAll(() => {
    server.use(
      http.get(titleQuery.client.path.list(), () => {
        return HttpResponse.json(stopWords);
      }),
      http.post(titleQuery.client.path.list(), () => {
        return new HttpResponse(undefined, { status: 201 });
      }),
      http.delete(titleQuery.client.path.detail({ id: 0 }), () => {
        return HttpResponse.json(undefined, { status: 204 });
      }),

      http.get(descQuery.client.path.list(), () => {
        return HttpResponse.json(stopWords);
      }),
      http.post(descQuery.client.path.list(), () => {
        return new HttpResponse(undefined, { status: 201 });
      }),
      http.delete(descQuery.client.path.detail({ id: 0 }), () => {
        return HttpResponse.json(undefined, { status: 204 });
      }),
    );
  });

  it.each(cases)("$name list should return the data", async ({ query }) => {
    const data = await callQueryFn(query.list(ref(false)));
    expect(data).toStrictEqual(stopWords);
  });

  it.each(cases)("$name query option staleTime should has correct staleTime", async ({ query }) => {
    expect(query.list(ref(false)).staleTime).toBe(Infinity);
  });

  it.each(cases)("$name list enabled should be disabled", async ({ query }) => {
    const q = query.list(ref(false));
    expect(unref(q.enabled)).toBe(false);
  });

  it.each(cases)("$name list enabled should be enabled", async ({ query }) => {
    const q = query.list(ref(true));
    expect(unref(q.enabled)).toBe(true);
  });

  it.each(cases)("$name add calls mutationFn should returns empty data", async ({ query }) => {
    expect(await query.create().mutationFn({ word: "foo" })).toBe("");
  });

  it.each(cases)("$name add onSuccess should call invalidateQueries", async ({ query }) => {
    const spy = vi.spyOn(queryClient, "invalidateQueries");
    await query.create().onSuccess();
    expect(spy).toHaveBeenCalledExactlyOnceWith({ queryKey: query.list(ref(true)).queryKey });
  });

  it.each(cases)("$name remove should return empty data", async ({ query }) => {
    const data = await query.delete().mutationFn(0);
    expect(data).toBe("");
  });

  it.each(cases)("$name remove should call invalidateQueries", async ({ query }) => {
    const spy = vi.spyOn(queryClient, "invalidateQueries");
    await query.delete().onSuccess();
    expect(spy).toHaveBeenCalledExactlyOnceWith({ queryKey: query.list(ref(true)).queryKey });
  });
});
