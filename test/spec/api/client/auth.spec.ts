import { http } from "msw";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { HttpResponse, server } from "test/utils/server";
import { authClient } from "src/api/client/auth";

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

describe("authClient", () => {
  const data = { message: "ok" };
  const mockHandler = vi.fn();

  beforeAll(() => {
    server.use(
      http.get(authClient.path.check(), ({ request }) => {
        mockHandler(request.headers.get("Authorization"));
        return HttpResponse.json(data);
      }),
    );
  });

  afterEach(() => {
    mockHandler.mockReset();
    getSessionMock.mockReset();
  });

  it("should get session data", async () => {
    getSessionMock.mockResolvedValueOnce({ data: { session: null } });
    await authClient.check();
    expect(getSessionMock).toHaveBeenCalledOnce();
  });

  it("should return correct response data", async () => {
    getSessionMock.mockResolvedValueOnce({ data: { session: { access_token: "mock-test-token" } } });
    const response = await authClient.check();
    expect(response.data).toStrictEqual(data);
  });

  it("should send correct authorization header", async () => {
    getSessionMock.mockResolvedValueOnce({ data: { session: { access_token: "mock-test-token" } } });

    await authClient.check();
    expect(mockHandler).toHaveBeenCalledWith("Bearer mock-test-token");
  });

  it("should not include auth token when logged out", async () => {
    getSessionMock.mockResolvedValueOnce({ data: { session: null } });

    await authClient.check();
    expect(mockHandler).toHaveBeenCalledWith(null);
  });
});
