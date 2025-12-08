import { http } from "msw";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { HttpResponse, server } from "test/utils/server";
import { BaseAPIClient, BasePath } from "src/api/client/base";
import { UseSessionFactory } from "test/utils/factories/external/supabase";

// Implement client based on abstract class to check axios client
class Path extends BasePath {
  basePath = "/";
}

class TestClient extends BaseAPIClient {
  path = new Path();

  check() {
    return this.client.get(this.path.basePath);
  }
}

const testClient = new TestClient();

const { getSessionMock, signOutMock } = vi.hoisted(() => {
  return {
    getSessionMock: vi.fn(),
    signOutMock: vi.fn(),
  };
});

vi.mock("@supabase/supabase-js", () => {
  const mockClient = {
    auth: {
      getSession: getSessionMock,
      signOut: signOutMock,
    },
  };
  return { createClient: vi.fn(() => mockClient) };
});

describe("TestClient", () => {
  const session = new UseSessionFactory().authenticated();
  const error = new UseSessionFactory().error();

  describe("Response ok", () => {
    const mockHandler = vi.fn();

    beforeAll(() => {
      server.use(
        http.get(testClient.path.basePath, ({ request }) => {
          mockHandler(request.headers.get("Authorization"));
          return HttpResponse.json();
        }),
      );
    });

    afterEach(() => {
      mockHandler.mockReset();
      getSessionMock.mockReset();
    });

    it("should get session data", async () => {
      getSessionMock.mockResolvedValueOnce(session);
      await testClient.check();
      expect(getSessionMock).toHaveBeenCalledOnce();
    });

    it("should return correct response data", async () => {
      getSessionMock.mockResolvedValueOnce(session);
      const response = await testClient.check();
      expect(response.data).toBe("");
    });

    it("should send correct authorization header", async () => {
      const resp = new UseSessionFactory().authenticated();
      getSessionMock.mockResolvedValueOnce(resp);

      await testClient.check();
      expect(mockHandler).toHaveBeenCalledWith(`Bearer ${resp.data.session.access_token}`);
    });

    it("should not include auth token when logged out", async () => {
      getSessionMock.mockResolvedValueOnce({ data: { session: null } });

      await testClient.check();
      expect(mockHandler).toHaveBeenCalledWith(null);
    });
  });

  describe("Response error", () => {
    beforeAll(() => {
      server.use(
        http.get(testClient.path.basePath, () => {
          return new HttpResponse({ error }, { status: 401 });
        }),
      );
    });

    afterEach(() => {
      getSessionMock.mockReset();
      signOutMock.mockReset();
    });

    it("should call signOut when unauthorized", async () => {
      getSessionMock.mockResolvedValueOnce(error);
      await expect(testClient.check()).rejects.toThrow("Request failed with status code 401");
      expect(signOutMock).toHaveBeenCalledOnce();
    });

    it("should not call signOut when unauthorized when user already on auth page", async () => {
      Object.defineProperty(window, "location", { value: { pathname: "/auth" } });

      getSessionMock.mockResolvedValueOnce(error);
      await expect(testClient.check()).rejects.toThrow();
      expect(signOutMock).not.toHaveBeenCalledOnce();
    });
  });
});
