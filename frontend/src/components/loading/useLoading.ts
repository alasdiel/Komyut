import { useCallback } from "react";
import { useLoadingStore } from "./loadingStore";

export function useLoading() {
  const loading = useLoadingStore((s) => s.loading);
  const setLoading = useLoadingStore((s) => s.setLoading);

  const startLoading = useCallback(() => setLoading(true), [setLoading]);
  const stopLoading = useCallback(() => setLoading(false), [setLoading]);

  return {
    loading,
    startLoading,
    stopLoading,
  };
}
