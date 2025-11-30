import { describe, expect, it, vi } from "vitest";
import { useRequest } from "src/hooks/useRequest";

describe("useRequest", () => {
  it("should set loading state during request", async () => {
    const mockCallback = vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
    const { loading, requestAsync } = useRequest(mockCallback);

    expect(loading.value).toBe(false);
    const promise = requestAsync();
    expect(loading.value).toBe(true);
    await promise;
    expect(loading.value).toBe(false);
  });

  it("should execute callback successfully", async () => {
    const mockCallback = vi.fn().mockResolvedValue({ data: "test" });
    const { requestAsync } = useRequest(mockCallback);

    await requestAsync();
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should handle errors gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Test error");
    const mockCallback = vi.fn().mockRejectedValue(error);
    const { loading, requestAsync } = useRequest(mockCallback);

    await requestAsync();
    expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(error);
    expect(loading.value).toBe(false);
    consoleErrorSpy.mockRestore();
  });

  it("should execute afterCallback when provided", async () => {
    const mockCallback = vi.fn().mockResolvedValue({ data: "test" });
    const mockAfterCallback = vi.fn();
    const { requestAsync } = useRequest(mockCallback, mockAfterCallback);

    await requestAsync();
    expect(mockAfterCallback).toHaveBeenCalledTimes(1);
  });
});
