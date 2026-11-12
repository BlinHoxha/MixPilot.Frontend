import { describe, expect, it, vi } from "vitest";
import {
  ApiError,
  createMixPilotApi,
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
  it("rejects a malformed success envelope", async () => {
    const api = createMixPilotApi({
      baseUrl: "https://api.example.test",
      fetch: async () => json({ items: [] }),
    });
    await expect(api.tracks()).rejects.toMatchObject({ status: 502 });
  });
});
