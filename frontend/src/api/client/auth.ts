import { BaseAPIClient, BasePath } from "src/api/client/base";

class Path extends BasePath {
  basePath = "/auth";

  check() {
    return this.url({ action: "check" });
  }
}

class AuthClient extends BaseAPIClient {
  path = new Path();

  check() {
    const url = this.path.check();
    return this.client.get<{ message: "ok" }>(url);
  }
}

export const authClient = new AuthClient();
