import createClient from "openapi-fetch";
import type { components, paths } from "./generated";
export type { components, paths } from "./generated";
type Schema = components["schemas"];
export type Track = Schema["TrackResponse"];
export type DjSet = Schema["SetResponse"];
export type Collection = Schema["CollectionResponse"];
export type SetIntentRequest = Schema["SetIntentRequest"];
export type SetIntentResponse = Schema["SetIntentResponse"];
export type CreateSetGenerationJobRequest = Schema["CreateSetGenerationJobRequest"];
export type SetGenerationJob = Schema["SetGenerationJobResponse"];
export type SetVersion = Schema["SetVersionResponse"];
export type SetRequirements = Schema["SetRequirementsRequest"];
export type TrackWrite = Schema["CreateTrackRequest"];
type GeneratedTrackQuery = NonNullable<
  paths["/api/v1/tracks"]["get"]["parameters"]["query"]
>;
export type TrackQuery = {
  [K in keyof GeneratedTrackQuery as Uncapitalize<K>]: GeneratedTrackQuery[K];
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public fields?: Record<string, string[]>,
    public traceId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Your session has expired. Sign in again.";
    if (error.status === 403)
      return "You do not have permission to perform this action.";
    if (error.status === 409)
      return `${error.message} Reload the latest data before trying again.`;
    return error.message;
  }
  if (error instanceof Error && error.name === "AbortError")
    return "The request was cancelled or timed out. Refresh before retrying a change.";
  return "Cannot reach MixPilot. Check your connection and that the API is running.";
}
export function shouldRetry(failures: number, error: unknown) {
  return failures < 2 && (!(error instanceof ApiError) || error.status >= 500);
}
export function intentErrorMessage(code?: string): string {
  switch (code) {
    case "prompt_not_interpretable": return "The prompt could not be understood. Try more specific musical details.";
    case "prompt_interpretation_unavailable": return "Prompt preview is not configured right now.";
    case "ai_provider_unavailable": return "The AI provider is unavailable. Try again later.";
    case "ai_provider_timeout": return "The AI provider timed out. Try a shorter prompt.";
    case "client_timeout": return "The AI model took too long to respond. Try again, or use a smaller model.";
    default: return code ? `Prompt preview failed (${code}).` : "Prompt preview failed. Try again.";
  }
}
export function jobErrorMessage(code?: string | null): string {
  switch (code) {
    case "prompt_not_interpretable": return intentErrorMessage(code);
    case "ai_provider_unavailable": case "ai_provider_timeout": return intentErrorMessage(code);
    case "no_eligible_tracks": return "No eligible tracks matched these requirements.";
    case "job_attempts_exhausted": return "This job could not finish after several attempts.";
    case "track_ineligible": return "A track is no longer eligible for this set.";
    default: return code ? `Set generation failed (${code}).` : "Set generation failed. Please try again.";
  }
}

export function createMixPilotApi(options: {
  baseUrl: string;
  getAccessToken?: () => Promise<string | undefined>;
  fetch?: typeof fetch;
  timeoutMs?: number;
  intentTimeoutMs?: number;
  onUnauthorized?: () => void;
}) {
  const transport: typeof fetch = async (input, init) => {
    const request = new Request(input, init);
    const controller = new AbortController();
    let timedOut = false;
    const abort = () => controller.abort();
    if (request.signal.aborted) abort();
    request.signal.addEventListener("abort", abort, { once: true });
    const intent = new URL(request.url).pathname === "/api/v1/set-intents";
    const timer = setTimeout(() => { timedOut = true; abort(); },
      intent ? options.intentTimeoutMs ?? 150000 : options.timeoutMs ?? 30000);
    try {
      return await (options.fetch ?? fetch)(
        new Request(request, { signal: controller.signal }),
      );
    } catch (error) {
      if (timedOut && !request.signal.aborted)
        throw new ApiError(0, "The request timed out.", "client_timeout");
      throw error;
    } finally {
      clearTimeout(timer);
      request.signal.removeEventListener("abort", abort);
    }
  };
  const client = createClient<paths>({
    baseUrl: options.baseUrl.replace(/\/$/, ""),
    fetch: transport,
  });
  client.use({
    async onRequest({ request }) {
      const token = await options.getAccessToken?.();
      if (token) request.headers.set("Authorization", `Bearer ${token}`);
      request.headers.set("Accept", "application/json");
      return request;
    },
    async onResponse({ response }) {
      if (response.ok) return response;
      const problem = (await response
        .clone()
        .json()
        .catch(() => ({}))) as Schema["ApiProblemResponse"];
      if (response.status === 401) options.onUnauthorized?.();
      throw new ApiError(
        response.status,
        problem.detail ||
          problem.title ||
          `Request failed (${response.status}).`,
        problem.code ?? undefined,
        problem.errors ?? undefined,
        problem.traceId ?? undefined,
      );
    },
  });
  async function read<T>(
    promise: Promise<{
      data?: { succeeded?: boolean; data?: T };
      response: Response;
    }>,
  ): Promise<NonNullable<T>> {
    const result = await promise;
    if (result.data?.succeeded !== true || result.data.data == null)
      throw new ApiError(502, "The API returned an unexpected response.");
    return result.data.data as NonNullable<T>;
  }
  const path = (id: string) => ({ path: { id } });
  return {
    capabilities: (signal?: AbortSignal) =>
      read(client.GET("/api/v1/capabilities", { signal })),
    tracks: (query: TrackQuery = {}, signal?: AbortSignal) =>
      read(
        client.GET("/api/v1/tracks", {
          params: {
            query: {
              Search: query.search,
              Genre: query.genre,
              MinBpm: query.minBpm,
              MaxBpm: query.maxBpm,
              SortBy: query.sortBy,
              Direction: query.direction,
              PageNumber: query.pageNumber,
              PageSize: query.pageSize,
            },
          },
          signal,
        }),
      ),
    track: (id: string, signal?: AbortSignal) =>
      read(client.GET("/api/v1/tracks/{id}", { params: path(id), signal })),
    createTrack: (body: Schema["CreateTrackRequest"]) =>
      read(client.POST("/api/v1/tracks", { body })),
    updateTrack: (id: string, body: Schema["UpdateTrackRequest"]) =>
      read(client.PUT("/api/v1/tracks/{id}", { params: path(id), body })),
    deleteTrack: async (id: string, expectedRevision: number) => {
      await client.DELETE("/api/v1/tracks/{id}", {
        params: { ...path(id), query: { expectedRevision } },
      });
    },
    importCsv: (body: Schema["CsvImportRequest"]) =>
      read(client.POST("/api/v1/imports/csv", { body })),
    collections: (pageNumber = 1, signal?: AbortSignal) =>
      read(
        client.GET("/api/v1/collections", {
          params: { query: { PageNumber: pageNumber, PageSize: 20 } },
          signal,
        }),
      ),
    createCollection: (body: Schema["SaveCollectionRequest"]) =>
      read(client.POST("/api/v1/collections", { body })),
    updateCollection: (id: string, body: Schema["SaveCollectionRequest"]) =>
      read(client.PUT("/api/v1/collections/{id}", { params: path(id), body })),
    sets: (pageNumber = 1, signal?: AbortSignal) =>
      read(
        client.GET("/api/v1/sets", {
          params: { query: { PageNumber: pageNumber, PageSize: 20 } },
          signal,
        }),
      ),
    set: (id: string, signal?: AbortSignal) =>
      read(client.GET("/api/v1/sets/{id}", { params: path(id), signal })),
    generateSet: (body: Schema["GenerateSetRequest"]) =>
      read(client.POST("/api/v1/sets/generate", { body })),
    interpretSetIntent: (body: SetIntentRequest, signal?: AbortSignal) =>
      read(client.POST("/api/v1/set-intents", { body, signal })),
    createSetGenerationJob: (body: CreateSetGenerationJobRequest, idempotencyKey: string) =>
      read(client.POST("/api/v1/set-generation-jobs", {
        body, params: { header: { "Idempotency-Key": idempotencyKey } },
      })),
    job: (id: string, signal?: AbortSignal) =>
      read(client.GET("/api/v1/jobs/{id}", { params: path(id), signal })),
    jobs: (query: { pageNumber?: number; pageSize?: number } = {}, signal?: AbortSignal) =>
      read(client.GET("/api/v1/jobs", {
        params: { query: { PageNumber: query.pageNumber, PageSize: query.pageSize } }, signal,
      })),
    cancelJob: (id: string) =>
      read(client.POST("/api/v1/jobs/{id}/cancel", { params: path(id) })),
    editSet: (id: string, body: Schema["EditSetRequest"]) =>
      read(client.PUT("/api/v1/sets/{id}/tracks", { params: path(id), body })),
    regenerateSet: (id: string, body: Schema["RegenerateSetRequest"]) =>
      read(
        client.POST("/api/v1/sets/{id}/regenerate", { params: path(id), body }),
      ),
    versions: (id: string, signal?: AbortSignal) =>
      read(
        client.GET("/api/v1/sets/{id}/versions", { params: path(id), signal }),
      ),
    version: (id: string, version: number, signal?: AbortSignal) =>
      read(
        client.GET("/api/v1/sets/{id}/versions/{version}", {
          params: { path: { id, version } },
          signal,
        }),
      ),
    approveSetVersion: (id: string, version: number, expectedRevision: number) =>
      read(client.POST("/api/v1/sets/{id}/versions/{version}/approve", {
        params: { path: { id, version } }, body: { expectedRevision },
      })),
    explain: (id: string, question: string) =>
      read(
        client.POST("/api/v1/sets/{id}/explanation", {
          params: path(id),
          body: { question },
        }),
      ),
    profile: (signal?: AbortSignal) =>
      read(client.GET("/api/v1/me/profile", { signal })),
    saveProfile: (body: Schema["SaveProfileRequest"]) =>
      read(client.PUT("/api/v1/me/profile", { body })),
  };
}
export type MixPilotApi = ReturnType<typeof createMixPilotApi>;
