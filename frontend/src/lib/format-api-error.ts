import { ApiError } from "@/lib/api";

export function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    const body = err.body;
    if (body && typeof body === "object") {
      const messages = Object.values(body as Record<string, unknown>)
        .flat()
        .map(String);
      if (messages.length) return messages.join(" ");
    }
    if (typeof body === "string" && body) return body;
  }
  return "Something went wrong. Please try again.";
}
