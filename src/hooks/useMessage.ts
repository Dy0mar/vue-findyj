import { useToast } from "primevue";
import type { ToastMessageOptions } from "primevue/toast";

export function useMessage() {
  const toast = useToast();

  function successMessage(summary?: ToastMessageOptions["summary"], detail?: ToastMessageOptions["detail"]) {
    toast.add({ severity: "success", summary, detail, life: 3000 });
  }

  function errorMessage(summary?: ToastMessageOptions["summary"], detail?: ToastMessageOptions["detail"]) {
    toast.add({ severity: "error", summary, detail, life: 3000 });
  }

  return {
    successMessage,
    errorMessage,
  };
}
