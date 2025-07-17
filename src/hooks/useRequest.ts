import { ref } from "vue";
import type { Answer } from "src/api/client/base";

export function useRequest<T>(cb: () => Answer<T>) {
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
  }

  return {
    loading,
    requestAsync,
  };
}
