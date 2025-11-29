import { unref } from "vue";

/**
 * Calls queryFn with queryKey and params.
 * To invoke queryFn directly, use this function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function callQueryFn<T extends Record<any, any>>(query: T) {
  const controller = new AbortController();
  let queryKey;
  if (Array.isArray(query.queryKey)) {
    queryKey = query.queryKey.map(unref);
  } else {
    queryKey = unref(query.queryKey);
  }
  return await query.queryFn!({
    queryKey: queryKey as readonly unknown[],
    // Only to make TypeScript happy. Usually all these params passes Tanstack query, but in tests we're calling
    // queryFn directly.
    signal: controller.signal,
    meta: undefined,
  });
}
