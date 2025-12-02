import { authClient } from "src/api/client/auth";

class AuthQuery {
  client = authClient;

  /**
   * Check me
   */
  check() {
    return {
      queryKey: ["api.auth.check"],
      queryFn: async () => (await this.client.check()).data,
    };
  }
}

export const authQuery = new AuthQuery();
