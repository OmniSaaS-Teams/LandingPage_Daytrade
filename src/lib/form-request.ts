export type SubmissionReceipt = { success: true; id: string; createdAt: string };

// Each form owns one instance. Retries of unchanged data reuse the same key,
// including when the server saved the first request but its response was lost.
export function createFormRequest() {
  let previous = "";
  let requestKey = "";
  return async function send<T extends SubmissionReceipt = SubmissionReceipt>(path: string, data: Record<string, unknown> | FormData, timeout = 15_000): Promise<T> {
    const multipart = data instanceof FormData;
    const pagePath = typeof window === "undefined" ? undefined : window.location.pathname;
    const fingerprint = JSON.stringify([path, pagePath, multipart
      ? Array.from(data.entries(), ([key, value]) => [key, typeof value === "string" ? value : [value.name, value.size, value.lastModified]])
      : data]);
    if (!requestKey || previous !== fingerprint) {
      requestKey = crypto.randomUUID();
      previous = fingerprint;
    }
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Idempotency-Key": requestKey, ...(pagePath ? { "X-Daytrade-Page-Path": pagePath } : {}), ...(!multipart ? { "Content-Type": "application/json" } : {}) },
        body: multipart ? data : JSON.stringify(data),
        signal: AbortSignal.timeout(timeout),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success !== true || typeof result.id !== "string") {
        // A conflict needs a fresh key on the next attempt (for example a file
        // replaced with the same name and size but different contents).
        if (response.status === 409) requestKey = "";
        throw new Error(typeof result?.error === "string" ? result.error : "Não foi possível confirmar o envio. Tente novamente.");
      }
      requestKey = "";
      return result as T;
    } catch (error) {
      if (error instanceof Error && error.name === "Error") throw error;
      throw new Error("Não foi possível confirmar o envio. Verifique sua conexão e tente novamente.");
    }
  };
}
