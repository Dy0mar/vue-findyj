import { afterEach, describe, expect, it, vi } from "vitest";
import { RouteLocationNormalizedFactory } from "test/utils/factories/external/router";
import { before } from "src/router/guards";
import { Names } from "src/router/names";
import { UseSessionFactory } from "test/utils/factories/external/supabase";

const { getSessionMock } = vi.hoisted(() => {
  return {
    getSessionMock: vi.fn(),
  };
});

vi.mock("@supabase/supabase-js", () => {
  const mockClient = {
    auth: {
      getSession: getSessionMock,
    },
  };
  return { createClient: vi.fn(() => mockClient) };
});

// Test the guard functions in isolation without the Vue Router.
describe("before guards", () => {
  const to = new RouteLocationNormalizedFactory().create();
  const from = new RouteLocationNormalizedFactory().create();
  const session = new UseSessionFactory().authenticated();
  const error = new UseSessionFactory().error();
  const next = vi.fn();

  afterEach(() => {
    next.mockReset();
    getSessionMock.mockReset();
  });

  it("should redirect to auth if not authenticated", async () => {
    getSessionMock.mockResolvedValue(error);
    to.path = "/";
    for (const guard of before) {
      await guard(to, from, next);
    }
    expect(next).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenCalledWith({ name: Names.AUTH.INDEX });
    expect(next).not.toHaveBeenCalledWith({ name: Names.HOME.INDEX });
  });

  it("should redirect to home from auth if authenticated", async () => {
    getSessionMock.mockResolvedValue(session);
    to.path = "/auth";
    for (const guard of before) {
      await guard(to, from, next);
    }
    expect(next).toHaveBeenCalledTimes(2);
    expect(next).not.toHaveBeenCalledWith({ name: Names.AUTH.INDEX });
    expect(next).toHaveBeenCalledWith({ name: Names.HOME.INDEX });
  });

  it("should not redirect to home from auth if not authenticated", async () => {
    getSessionMock.mockResolvedValue(error);
    to.path = "/auth";
    for (const guard of before) {
      await guard(to, from, next);
    }
    expect(next).toHaveBeenCalledTimes(2);
    expect(next).not.toHaveBeenCalledWith({ name: Names.AUTH.INDEX });
    expect(next).not.toHaveBeenCalledWith({ name: Names.HOME.INDEX });
  });

  it("should not redirect to home any path if authenticated", async () => {
    getSessionMock.mockResolvedValue(session);
    to.path = "/any";
    for (const guard of before) {
      await guard(to, from, next);
    }
    expect(next).toHaveBeenCalledTimes(2);
    expect(next).not.toHaveBeenCalledWith({ name: Names.AUTH.INDEX });
    expect(next).not.toHaveBeenCalledWith({ name: Names.HOME.INDEX });
  });
});
