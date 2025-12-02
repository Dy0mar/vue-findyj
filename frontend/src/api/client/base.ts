/**
 * An abstract classes for creating API clients.
 */

import axios, { type AxiosResponse } from "axios";
import { supabase } from "src/api/client/supabase";

type URLTemplateParams = Record<string, string | number>;

const AXIOS_BASE: string = import.meta.env.VITE_BASE_URL;

export abstract class BasePath<URL_TEMPLATE_PARAMS extends URLTemplateParams = never> {
  /**
   * The base path for the service. Can be simple `/` or nested, for example `/parent/:parentId/child/`.
   * Always define `NESTING_PARAMS` if the base path is nested.
   * Base path should not include the action or detail tokens, `getURLTemplate` will handle that.
   * @type {string}
   * @protected
   */
  protected abstract basePath: string;

  protected url(ctx: { action: string; params?: URL_TEMPLATE_PARAMS }): string;

  /**
   * @description get the URL for a given action
   */
  protected url(ctx: { action: string; params?: URL_TEMPLATE_PARAMS }): string {
    const baseTokens = ["", "v1", "api", ...this.basePath.split("/").slice(1), ctx.action];
    const url = baseTokens.join("/").format(ctx.params || {});
    return url.endsWith("/") ? url.substring(0, url.length - 1) : url;
  }
}

const axiosClient = axios.create({
  baseURL: AXIOS_BASE,
  headers: {
    Accept: "application/json;",
  },
});

axiosClient.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export abstract class BaseAPIClient<URL_TEMPLATE_PARAMS extends URLTemplateParams = never> {
  /**
   * The base path for the service. Can be simple `/` or nested, for example `/parent/:parentId/child/`.
   * Always define `NESTING_PARAMS` if the base path is nested.
   * Base path should not include the action or detail tokens, `getURLTemplate` will handle that.
   * @type {string}
   * @protected
   */
  protected abstract path: BasePath<URL_TEMPLATE_PARAMS>;
  client = axiosClient;
}

export type Answer<T> = Promise<AxiosResponse<T>>;
