import { AxiosHeaders, type AxiosResponse } from "axios";
import { Factory } from "test/utils/factories/Factory";

export class AxiosResponseFactory extends Factory<AxiosResponse> {
  /**
   * Generate a generic Axios response object for tests.
   */
  generate() {
    return {
      data: null,
      status: 200,
      statusText: "ok",
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
    };
  }
}
