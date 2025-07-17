import type { SignInOptions } from "src/types/models/auth.ts";
import { BaseAPIClient, BasePath } from "src/api/client/base";

class Path extends BasePath {
  basePath = "/auth";

  check() {
    return this.url({ action: "check" });
  }

  login() {
    return this.url({ action: "access-token" });
  }
}

class AuthClient extends BaseAPIClient {
  path = new Path();

  check() {
    const url = this.path.check();
    return this.client.get(url);
  }

  login(ctx: { data: SignInOptions }) {
    const url = this.path.login();
    return this.client.post<string>(url, ctx.data);
  }
}

export const authClient = new AuthClient();
