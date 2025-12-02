import { useToast } from "primevue/usetoast";

export function useMessage() {
  const toast = useToast();

  function successMessage(summary: string, detail: string) {
    toast.add({ severity: "success", summary, detail, life: 3000 });
  }

  function errorMessage(summary: string, detail: string) {
    toast.add({ severity: "error", summary, detail, life: 3000 });
  }

  return {
    successMessage,
    errorMessage,
  };
}
