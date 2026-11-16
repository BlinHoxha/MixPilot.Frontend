import { describe, expect, it, vi } from "vitest";
import {
  ApiError,
  createMixPilotApi,
  intentErrorMessage,
  jobErrorMessage,
  shouldRetry,
} from "../packages/api-client/src/index";
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
describe("shared API transport", () => {
  it("uses generated query parameters, bearer authentication and unwraps paginated responses", async () => {
    const transport = vi.fn<typeof fetch>(async (input) => {
      const request = input as Request;
      const url = new URL(request.url);
      expect(url.searchParams.get("PageNumber")).toBe("2");
      expect(url.searchParams.get("Search")).toBe("a & b");
      expect(request.headers.get("Authorization")).toBe("Bearer test-token");
      return json({
        succeeded: true,
        data: { items: [], totalCount: 0, totalPages: 0 },
      });
    });
    const api = createMixPilotApi({
      baseUrl: "https://api.example.test",
      fetch: transport,
      getAccessToken: async () => "test-token",
    });
    expect(await api.tracks({ pageNumber: 2, search: "a & b" })).toMatchObject({
      items: [],
    });
    expect(transport).toHaveBeenCalledTimes(1);
  });
  it("supports 204 deletes and carries the expected revision", async () => {
    const transport = vi.fn<typeof fetch>(async (input) => {
      expect((input as Request).url).toContain("expectedRevision=7");
      return new Response(null, { status: 204 });
    });
    await expect(
      createMixPilotApi({
        baseUrl: "https://api.example.test",
        fetch: transport,
      }).deleteTrack("track-1", 7),
    ).resolves.toBeUndefined();
  });
  it("preserves field errors, conflict codes and trace IDs without retrying mutations", async () => {
    const transport = vi.fn<typeof fetch>(async () =>
      json(
        {
          detail: "The track has changed.",
          code: "revision_conflict",
          traceId: "trace-1",
          errors: { expectedRevision: ["Stale revision"] },
        },
        409,
      ),
    );
    const api = createMixPilotApi({
      baseUrl: "https://api.example.test",
      fetch: transport,
    });
    await expect(api.deleteTrack("track-1", 1)).rejects.toMatchObject({
      status: 409,
      code: "revision_conflict",
      traceId: "trace-1",
      fields: { expectedRevision: ["Stale revision"] },
    });
    expect(transport).toHaveBeenCalledTimes(1);
    expect(shouldRetry(0, new ApiError(409, "Conflict"))).toBe(false);
  });
  it("handles unauthenticated responses without requiring a JSON body", async () => {
    const onUnauthorized = vi.fn();
    const api = createMixPilotApi({
      baseUrl: "https://api.example.test",
      fetch: async () => new Response(null, { status: 401 }),
      onUnauthorized,
    });
    await expect(api.tracks()).rejects.toMatchObject({ status: 401 });
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });
  it("cancels pending requests through the caller signal", async () => {
    const controller = new AbortController();
    const transport: typeof fetch = async (input) =>
      new Promise((_resolve, reject) => {
        const signal = (input as Request).signal;
        signal.addEventListener("abort", () =>
          reject(new DOMException("Cancelled", "AbortError")),
        );
        if (signal.aborted) reject(new DOMException("Cancelled", "AbortError"));
      });
    const pending = createMixPilotApi({
      baseUrl: "https://api.example.test",
      fetch: transport,
    }).tracks({}, controller.signal);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });
  it("uses 150 seconds for intent preview and 30 seconds for other calls", async () => {
    vi.useFakeTimers();
    try {
      const transport: typeof fetch = async (input) =>
        new Promise((_resolve, reject) => {
          (input as Request).signal.addEventListener("abort", () =>
            reject(new DOMException("Timed out", "AbortError")), { once: true });
        });
      const api = createMixPilotApi({ baseUrl: "https://api.example.test", fetch: transport });
      const preview = api.interpretSetIntent({ prompt: "House", territory: "HU" });
      const tracks = api.tracks();
      const trackOutcome = tracks.catch((error: unknown) => error);
      const previewOutcome = preview.catch((error: unknown) => error);
      await vi.advanceTimersByTimeAsync(30_000);
      expect(await trackOutcome).toMatchObject({ code: "client_timeout" });
      let settled = false;
      void previewOutcome.then(() => { settled = true; });
      await vi.advanceTimersByTimeAsync(119_999);
      expect(settled).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      expect(await previewOutcome).toMatchObject({ code: "client_timeout" });
    } finally { vi.useRealTimers(); }
  });
  it("rejects a malformed success envelope", async () => {
    const api = createMixPilotApi({
      baseUrl: "https://api.example.test",
      fetch: async () => json({ items: [] }),
    });
    await expect(api.tracks()).rejects.toMatchObject({ status: 502 });
  });
  it("sends job idempotency keys, reads 202 envelopes, and approves with a revision", async () => {
    const transport = vi.fn<typeof fetch>(async (input) => {
      const request = input as Request;
      if (request.url.endsWith("/set-generation-jobs")) {
        expect(request.headers.get("Idempotency-Key")).toBe("one-submission-key");
        expect(await request.json()).toMatchObject({ name: "Evening flow" });
        return json({ succeeded: true, data: { id: "job-1", status: "queued" } }, 202);
      }
      expect(request.url).toContain("/sets/set-1/versions/2/approve");
      expect(await request.json()).toMatchObject({ expectedRevision: 7 });
      return json({ succeeded: true, data: { id: "set-1", approvedVersion: 2, status: "approved" } });
    });
    const api = createMixPilotApi({ baseUrl: "https://api.example.test", fetch: transport });
    await expect(api.createSetGenerationJob({ name: "Evening flow", requirements: {
      durationSeconds: 3600, territory: "HU", excludedTrackIds: [],
    } }, "one-submission-key")).resolves.toMatchObject({ id: "job-1", status: "queued" });
    await expect(api.approveSetVersion("set-1", 2, 7)).resolves.toMatchObject({ approvedVersion: 2 });
  });
  it("maps known prompt and job codes and includes unknown job codes", () => {
    expect(intentErrorMessage("prompt_not_interpretable")).toContain("could not be understood");
    expect(intentErrorMessage("ai_provider_timeout")).toContain("timed out");
    expect(jobErrorMessage("no_eligible_tracks")).toContain("No eligible tracks");
    expect(jobErrorMessage("new_failure_code")).toContain("new_failure_code");
  });
});
