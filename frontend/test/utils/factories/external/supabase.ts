import { Factory } from "test/utils/factories/Factory";
import { merge } from "lodash";
import { faker } from "@faker-js/faker";

type SupabaseEmpty = {
  data: {
    session: null;
  };
  error: null;
};
type SupabaseError = {
  data: {
    session: null;
  };
  error: { message: string; status: number; code: string };
};
type SupabaseOk = {
  data: {
    session: { access_token: string };
  };
  error: null;
};

export class UseSessionFactory extends Factory<SupabaseEmpty | SupabaseError | SupabaseOk> {
  /**
   * Creates RouteLocationNormalized object.
   */
  generate() {
    return {
      data: {
        session: null,
      },
      error: null,
    };
  }

  authenticated(access_token?: string): SupabaseOk {
    return merge(this.generate(), { data: { session: { access_token: access_token || faker.internet.jwt() } } });
  }

  error(message?: string, status?: number, code?: string): SupabaseError {
    const error = {
      message: message || "Invalid credentials",
      status: status || 401,
      code: code || "no_authorization",
    };
    return merge(this.generate(), { error });
  }
}
