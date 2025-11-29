import { ref } from "vue";
import type { Answer } from "src/api/client/base";

/**
 * A composable hook that handles asynchronous requests with loading state management.
 * @template T The type of data returned by the request callback
 * @param cb The callback function that returns an Answer<T> promise
 * @param afterCb Optional callback function to execute after the request completes
 * @returns An object containing loading state and request execution function
 */
export function useRequest<T>(cb: () => Answer<T>, afterCb?: () => void) {
  const loading = ref(false);

  async function requestAsync() {
    try {
      loading.value = true;
      await cb();
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
    if (afterCb) {
      afterCb();
    }
  }

  return {
    loading,
    requestAsync,
  };
}
