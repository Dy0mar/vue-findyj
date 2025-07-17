import type { SignInOptions } from "src/types/models/auth";
import type { CategoryDetailOut } from "src/types/models/crawler/category";
import type { UseMutationOptions, UseQueryOptions } from "src/api/query/types";
import { authClient } from "src/api/client/auth";

class AuthQuery {
  client = authClient;

  /**
   * Check me
   */
  check() {
    return {
      queryKey: ["api.auth.me"],
      queryFn: async () => (await this.client.check()).data,
    } satisfies UseQueryOptions<CategoryDetailOut[]>;
  }

  /**
   * Login
   */
  login() {
    return {
      mutationFn: async (data) => (await this.client.login({ data })).data,
    } satisfies UseMutationOptions<SignInOptions, string>;
  }
}

export const authQuery = new AuthQuery();
