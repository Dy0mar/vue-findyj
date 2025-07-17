import type {
  QueryKey,
  UseInfiniteQueryOptions as UseBaseInfiniteQueryOptions,
  UseMutationOptions as UseBaseMutationOptions,
  UseQueryOptions as UseBaseQueryOptions,
  InfiniteData,
} from "@tanstack/vue-query";
import type { AxiosError } from "axios";
import type { Paginated } from "src/types/models/extra";

/**
 * Usage:
 * ```ts
 * function fun() {
 *    return {
 *      queryKey: ["foo"],
 *      queryFn: async (ctx) => ({
 *        foo: 1
 *      }) satisfies UseQueryOptions<{foo: number}>
 *    }
 * }
 * ```
 */
export type UseQueryOptions<TQueryFnData, TQueryKey extends QueryKey = QueryKey> = UseBaseQueryOptions<
  TQueryFnData,
  AxiosError,
  TQueryFnData,
  TQueryFnData,
  TQueryKey
>;

/**
 * Usage:
 * ```ts
 *   foo = () =>
 *     ({
 *       mutationFn: async (data) => {
 *         await this.client.do({ data });
 *       },
 *     }) satisfies UseMutationOptions<number[]>;
 * ```
 * Note that the TVariables and TData are switched, we usually don't use TData, but TVariables always.
 */
export type UseMutationOptions<TVariables, TData = void> = UseBaseMutationOptions<TData, AxiosError, TVariables>;

export type UseInfiniteQueryOptions<
  TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TQueryResponseData = TQueryFnData,
> = UseBaseInfiniteQueryOptions<
  /**
   * Request data
   */
  TQueryFnData,
  /**
   * Response error
   */
  AxiosError,
  /**
   * Response success
   */
  TQueryResponseData,
  TQueryKey,
  number
>;

// Usually an infinite query return type is a paginated response.
export type Pages<T> = InfiniteData<Paginated<T>>;
