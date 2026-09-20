// Expo replaces direct `process.env.EXPO_PUBLIC_*` references while bundling.
// Reading env through globalThis works in Node, but leaves the native bundle
// without the configured backend URL.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "{API_BASE_URL}";

export type TokenProvider = () => Promise<string | null>;
let tokenProvider: TokenProvider = async () => null;

export const configureApi = (provider: TokenProvider) => {
  tokenProvider = provider;
};
export const apiConfigured = () =>
  Boolean(
    API_BASE_URL &&
    !API_BASE_URL.includes("{") &&
    !API_BASE_URL.includes("your-api-host"),
  );

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 35_000,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = await tokenProvider();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: options.signal ?? controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `API_TIMEOUT: Sunucu ${Math.round(timeoutMs / 1000)} saniye içinde cevap vermedi.`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
  if (response.status === 401) throw new Error("AUTH_REQUIRED");
  if (response.status === 429) throw new Error("RATE_LIMITED");
  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.detail ?? body?.title ?? body?.message ?? "";
    } catch {
      // The endpoint may return an empty response for an error.
    }
    throw new Error(`API_${response.status}${detail ? `: ${detail}` : ""}`);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export const apiRoutes = {
  summary: (date: string) => `/api/daily-logs/summary?date=${date}`,
  dailyLog: (date: string) => `/api/daily-logs?date=${date}`,
  water: "/api/daily-logs/water",
  items: "/api/daily-logs/items",
  dailyLogItem: (itemId: string) => `/api/daily-logs/items/${itemId}`,
  foodByBarcode: (barcode: string) =>
    `/api/foods/barcode/${encodeURIComponent(barcode)}`,
  analyzeFoodImage: "/api/foods/analyze-image",
  foodsRecent: "/api/foods/recent",
  foodsFavorites: "/api/foods/favorites",
  profile: "/api/profile",
  nutritionGoalManual: "/api/nutrition-goals/manual",
  weekly: (weekStart: string) =>
    `/api/analytics/weekly-summary?weekStart=${weekStart}`,
};
