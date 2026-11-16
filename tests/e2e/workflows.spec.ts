import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
const track = {
  id: "11111111-1111-4111-8111-111111111111",
  revision: 1,
  title: "Lost in Motion",
  artist: "KLTR",
  version: "",
  durationSeconds: 438,
  bpm: 122,
  musicalKey: "8A",
  energy: 6,
  genre: "Deep House",
  mood: "",
  hasVocals: null,
  source: "myLibrary",
  availability: "registeredMetadata",
  rights: { canReference: true, canStream: false },
  createdAt: "2026-10-08T10:00:00Z",
  updatedAt: "2026-10-08T10:00:00Z",
};
const second = {
  ...track,
  id: "22222222-2222-4222-8222-222222222222",
  title: "Midnight Call",
  artist: "Solee",
  bpm: 123,
  musicalKey: "9A",
};
async function mockApi(page: Page) {
  let tracks = [track, second];
  let set = {
    id: "33333333-3333-4333-8333-333333333333",
    revision: 1,
    version: 1,
    name: "Evening flow",
    requirements: {
      durationSeconds: 3600,
      minBpm: 120,
      maxBpm: 126,
      genre: null,
      territory: "HU",
      energyCurve: "gradualBuild",
      mode: "planning",
      excludedTrackIds: [],
    },
    durationSeconds: 876,
    tracks: tracks.map((t, i) => ({
      ...t,
      trackId: t.id,
      position: i + 1,
      isLocked: false,
      compatibility: 0.9,
      reasons: ["Fits the requested BPM range."],
    })),
    warnings: ["Your library did not fill the requested duration."],
  };
  await page.route("http://localhost:5290/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    const ok = (data: unknown, status = 200) =>
      route.fulfill({ status, json: { succeeded: true, data, error: null } });
    const paged = (items: unknown[]) => ({
      items,
      pageNumber: 1,
      pageSize: 20,
      totalCount: items.length,
      totalPages: 1,
    });
    if (path.endsWith("/capabilities"))
      return ok({ enabledFeatures: ["personalLibrary", "setExplanations"] });
    if (path.endsWith("/explanation"))
      return ok({
        setId: set.id,
        version: set.version,
        explanation: {
          answer: "This set moves through compatible tempos.",
          provider: "Local",
          grounded: true,
        },
      });
    if (path === "/api/v1/imports/csv")
      return ok({ createdCount: 1, skippedDuplicateCount: 0 });
    if (path === "/api/v1/tracks" && method === "GET") {
      const search = url.searchParams.get("Search")?.toLowerCase() ?? "";
      return ok(
        paged(
          tracks.filter((t) =>
            `${t.title} ${t.artist}`.toLowerCase().includes(search),
          ),
        ),
      );
    }
    if (path === "/api/v1/tracks" && method === "POST") {
      const added = {
        ...track,
        ...request.postDataJSON(),
        id: "44444444-4444-4444-8444-444444444444",
      };
      tracks = [...tracks, added];
      return ok(added, 201);
    }
    if (path.startsWith("/api/v1/tracks/")) {
      const found = tracks.find((t) => path.endsWith(t.id));
      if (method === "DELETE") {
        tracks = tracks.filter((t) => t !== found);
        return route.fulfill({ status: 204 });
      }
      if (method === "PUT") {
        const updated = { ...found, ...request.postDataJSON(), revision: 2 };
        tracks = tracks.map((t) => (t === found ? updated : t));
        return ok(updated);
      }
      return ok(found);
    }
    if (path === "/api/v1/collections" && method === "POST")
      return ok(
        { ...request.postDataJSON(), id: "collection-1", revision: 1 },
        201,
      );
    if (path === "/api/v1/collections") return ok(paged([]));
    if (path === "/api/v1/sets") return ok(paged([set]));
    if (path.endsWith("/sets/generate")) {
      set = { ...set, ...request.postDataJSON() };
      return ok(set, 201);
    }
    if (path.endsWith("/regenerate")) {
      set = { ...set, version: set.version + 1, revision: set.revision + 1 };
      return ok(set);
    }
    if (path.endsWith("/versions")) return ok([{ version: 1 }]);
    if (path.endsWith("/tracks") && method === "PUT") {
      const body = request.postDataJSON();
      set = {
        ...set,
        version: set.version + 1,
        revision: set.revision + 1,
        tracks: body.orderedTrackIds.map((id: string, i: number) => ({
          ...set.tracks.find((t) => t.trackId === id),
          position: i + 1,
          isLocked: body.lockedTrackIds.includes(id),
        })),
      };
      return ok(set);
    }
    if (path.startsWith("/api/v1/sets/")) return ok(set);
    if (path.endsWith("/me/profile"))
      return route.fulfill({ status: 404, json: { title: "Not found" } });
    return route.fulfill({
      status: 404,
      json: { title: "Unknown mock route" },
    });
  });
}
test.beforeEach(async ({ page }) => mockApi(page));
test("library search, detail, metadata creation and collection selection", async ({
  page,
}) => {
  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
  await page.getByRole("textbox", { name: "Search library" }).fill("Midnight");
  await expect(
    page.getByRole("button", { name: "Midnight Call Solee" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Lost in Motion KLTR" }),
  ).toHaveCount(0);
  await page.getByRole("textbox", { name: "Search library" }).fill("");
  await page.getByRole("button", { name: "Lost in Motion KLTR" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Audio playback and analysis are not available yet",
  );
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Add track", exact: true }).click();
  await page.getByLabel("Track title", { exact: true }).fill("New horizon");
  await page.getByLabel("Artist", { exact: true }).fill("Test Artist");
  await page.getByLabel("Duration (seconds)").fill("300");
  await page.getByLabel("I am authorized to register this track").check();
  await page.getByRole("button", { name: "Save track" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "New horizon Test Artist" }),
  ).toBeVisible();
  await page.getByRole("checkbox", { name: "Select New horizon" }).check();
  await page.getByRole("button", { name: "Create playlist" }).click();
  await page.getByLabel("Playlist name").fill("Warm-up");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create playlist" })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("CSV import reports the actual result", async ({ page }) => {
  await page.goto("/library");
  await page.getByRole("button", { name: "Import CSV" }).click();
  await page.getByLabel("Choose CSV file").setInputFiles({
    name: "tracks.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("artist,title,durationSeconds\nTest,New,300"),
  });
  await page.getByLabel("I am authorized to register these").check();
  await page
    .getByRole("button", { name: "Import tracks", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Imported 1 tracks");
});
test("generates, reorders, locks and saves a versioned set", async ({
  page,
}) => {
  await page.goto("/builder");
  await page.getByRole("button", { name: "Generate set", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Move Lost in Motion down" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Move Lost in Motion down" }).click();
  await page
    .getByRole("button", { name: "Lock Lost in Motion", exact: true })
    .click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText(/Version 2/).first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save changes" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Regenerate unlocked" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Regenerate unlocked" }).click();
  await expect(page.getByText(/Version 3/).first()).toBeVisible();
  await page.getByRole("button", { name: "Explain set", exact: true }).click();
  await expect(
    page.getByText("This set moves through compatible tempos."),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Energy flow" }).click();
  await expect(
    page.getByRole("img", { name: /energy across the set/ }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/builder-${test.info().project.name}.png`,
    fullPage: true,
  });
});
test("surfaces revision conflicts and keeps the editor open", async ({
  page,
}) => {
  await page.route("**/api/v1/tracks/*", (route) =>
    route.request().method() === "PUT"
      ? route.fulfill({
          status: 409,
          json: {
            detail: "The track was changed elsewhere.",
            code: "revision_conflict",
          },
        })
      : route.fallback(),
  );
  await page.goto("/library");
  await page.getByRole("button", { name: "Lost in Motion KLTR" }).click();
  await page.getByRole("button", { name: "Edit metadata" }).click();
  await page.getByRole("button", { name: "Save track" }).click();
  await expect(page.getByRole("alert")).toContainText("Reload the latest data");
  await expect(page.getByLabel("Track title", { exact: true })).toHaveValue(
    "Lost in Motion",
  );
});
test("renders a new profile form and contains no viewport overflow", async ({
  page,
}) => {
  await page.goto("/settings");
  await expect(page.getByLabel("Display name")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("prompt preview fills editable fields and a job navigates to its result", async ({ page }) => {
  const resultId = "33333333-3333-4333-8333-333333333333";
  let polls = 0;
  let submitted: Record<string, unknown> | undefined;
  await page.route("**/api/v1/capabilities", (route) => route.fulfill({ json: {
    succeeded: true, data: { enabledFeatures: ["personalLibrary", "promptInterpretation", "setGenerationJobs"] },
  } }));
  await page.route("**/api/v1/set-intents", (route) => route.fulfill({ json: {
    succeeded: true, data: { requirements: {
      durationSeconds: 3600, minBpm: 120, maxBpm: 130, genre: "House", mood: "Late",
      hasVocals: false, energyCurve: "wave", territory: "HU", mode: "planning", excludedTrackIds: [],
    }, assumptions: ["Duration inferred"], unresolved: ["sunset"] },
  } }));
  await page.route("**/api/v1/set-generation-jobs", (route) => {
    submitted = route.request().postDataJSON();
    expect(route.request().headers()["idempotency-key"]).toBeTruthy();
    return route.fulfill({ status: 202, json: { succeeded: true, data: { id: "job-1", status: "queued", progress: 0 } } });
  });
  await page.route("**/api/v1/jobs/job-1", (route) => {
    polls++;
    const status = polls === 1 ? "running" : "succeeded";
    return route.fulfill({ json: { succeeded: true, data: {
      id: "job-1", status, progress: status === "running" ? 50 : 100,
      resultSetId: status === "succeeded" ? resultId : null,
    } } });
  });
  await page.goto("/builder");
  await page.getByLabel("Describe your set").fill("A one hour house set");
  await page.getByRole("button", { name: "Preview prompt" }).click();
  await expect(page.getByText("Duration inferred")).toBeVisible();
  await expect(page.getByText("sunset")).toBeVisible();
  await expect(page.getByLabel("Genre")).toHaveValue("House");
  await page.getByLabel("Genre").fill("Deep House");
  await page.getByRole("button", { name: "Generate set", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/builder/${resultId}$`));
  expect(submitted).toMatchObject({ name: "Evening flow", requirements: { genre: "Deep House", mood: "Late", hasVocals: false,
    durationSeconds: 3600, minBpm: 120, maxBpm: 130 } });
  const posted = submitted?.requirements as Record<string, unknown>;
  expect(typeof posted.durationSeconds).toBe("number");
  expect(typeof posted.minBpm).toBe("number");
  expect(polls).toBeGreaterThanOrEqual(2);
});

test("prompt preview is hidden when its capability is absent", async ({ page }) => {
  await page.goto("/builder");
  await expect(page.getByRole("region", { name: "Prompt preview" })).toHaveCount(0);
});

test("prompt preview shows a specific client timeout message", async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => {
    const original = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const request = new Request(input, init);
      if (new URL(request.url).pathname !== "/api/v1/set-intents") return original(input, init);
      return new Promise((_resolve, reject) => {
        request.signal.addEventListener("abort", () => reject(new DOMException("Timed out", "AbortError")), { once: true });
      });
    };
  });
  await page.route("**/api/v1/capabilities", (route) => route.fulfill({ json: {
    succeeded: true, data: { enabledFeatures: ["promptInterpretation"] },
  } }));
  await page.goto("/builder");
  await page.getByLabel("Describe your set").fill("A house set");
  await page.getByRole("button", { name: "Preview prompt" }).click();
  await expect(page.getByRole("button", { name: "Previewing…" })).toBeVisible();
  await page.clock.fastForward(150_001);
  await expect(page.getByRole("alert")).toContainText("The AI model took too long to respond");
});

test("prompt preview rounds minutes and falls back to synchronous generation", async ({ page }) => {
  let synchronous = 0;
  await page.route("**/api/v1/capabilities", (route) => route.fulfill({ json: {
    succeeded: true, data: { enabledFeatures: ["promptInterpretation"] },
  } }));
  await page.route("**/api/v1/set-intents", (route) => route.fulfill({ json: {
    succeeded: true, data: { requirements: {
      durationSeconds: 3630, minBpm: 120, maxBpm: 130, territory: "HU", excludedTrackIds: [],
    }, assumptions: [], unresolved: [] },
  } }));
  await page.route("**/api/v1/sets/generate", async (route) => {
    synchronous++;
    expect(route.request().postDataJSON().requirements.durationSeconds).toBe(3660);
    await route.fulfill({ json: { succeeded: true, data: {
      id: "33333333-3333-4333-8333-333333333333", name: "Evening flow", revision: 1,
      requirements: { durationSeconds: 3660, territory: "HU", excludedTrackIds: [] }, tracks: [],
    } } });
  });
  await page.goto("/builder");
  await page.getByLabel("Describe your set").fill("A house set");
  await page.getByRole("button", { name: "Preview prompt" }).click();
  await expect(page.getByLabel("Duration (minutes)")).toHaveValue("61");
  await page.getByRole("button", { name: "Generate set", exact: true }).click();
  await expect(page).toHaveURL(/\/builder\//);
  expect(synchronous).toBe(1);
});

test("job polling stops at its five minute cap", async ({ page }) => {
  await page.clock.install();
  await page.route("**/api/v1/capabilities", (route) => route.fulfill({ json: {
    succeeded: true, data: { enabledFeatures: ["setGenerationJobs"] },
  } }));
  await page.route("**/api/v1/set-generation-jobs", (route) => route.fulfill({ status: 202, json: {
    succeeded: true, data: { id: "job-cap", status: "queued" },
  } }));
  let polls = 0;
  await page.route("**/api/v1/jobs/job-cap", (route) => {
    polls++;
    return route.fulfill({ json: { succeeded: true, data: { id: "job-cap", status: "running", progress: 25 } } });
  });
  await page.goto("/builder");
  await page.getByRole("button", { name: "Generate set", exact: true }).click();
  await expect(page.getByText("Status: running", { exact: false })).toBeVisible();
  await page.clock.fastForward(300_001);
  await expect(page.getByText("Still running; check Recent jobs on the dashboard.")).toBeVisible();
  const stoppedAt = polls;
  await page.clock.fastForward(10_000);
  expect(polls).toBe(stoppedAt);
});

test("a failed job shows its code and a running job can be cancelled", async ({ page }) => {
  await page.route("**/api/v1/capabilities", (route) => route.fulfill({ json: {
    succeeded: true, data: { enabledFeatures: ["setGenerationJobs"] },
  } }));
  let submissions = 0;
  await page.route("**/api/v1/set-generation-jobs", (route) => {
    submissions++;
    return route.fulfill({ status: 202, json: { succeeded: true, data: { id: `job-${submissions}`, status: "queued" } } });
  });
  await page.route("**/api/v1/jobs/job-*", (route) => {
    const id = new URL(route.request().url()).pathname.split("/").at(-1);
    return route.fulfill({ json: { succeeded: true, data: id === "job-1"
      ? { id, status: "failed", errorCode: "no_eligible_tracks" }
      : { id, status: "running", progress: 25 } } });
  });
  await page.route("**/api/v1/jobs/job-2/cancel", (route) => route.fulfill({ json: {
    succeeded: true, data: { id: "job-2", status: "cancelled", progress: 25 },
  } }));
  await page.goto("/builder");
  await expect(page.getByLabel("Describe your set")).toHaveCount(0);
  await page.getByRole("button", { name: "Generate set", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("No eligible tracks");
  await page.getByRole("button", { name: "Generate set", exact: true }).click();
  await expect(page.getByRole("button", { name: "Cancel job" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel job" }).click();
  await expect(page.getByText("Status: cancelled")).toBeVisible();
});

test("version approval handles an ineligible track then shows approved status", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/v1/sets/*/versions/*/approve", (route) => {
    expect(route.request().postDataJSON()).toMatchObject({ expectedRevision: 1 });
    attempts++;
    if (attempts === 1) return route.fulfill({ status: 422, json: {
      code: "track_ineligible", detail: "A track is no longer eligible.",
    } });
    return route.fulfill({ json: { succeeded: true, data: {
      id: "33333333-3333-4333-8333-333333333333", name: "Evening flow", revision: 2,
      version: 1, status: "approved", approvedVersion: 1, tracks: [],
      requirements: { durationSeconds: 3600, territory: "HU", excludedTrackIds: [] },
    } } });
  });
  await page.goto("/builder/33333333-3333-4333-8333-333333333333");
  await page.getByRole("button", { name: "Approve this version" }).click();
  await expect(page.getByRole("alert")).toContainText("A track is no longer eligible.");
  await page.getByRole("button", { name: "Approve this version" }).click();
  await expect(page.getByText("Approved version: 1")).toBeVisible();
  await expect(page.getByText("approved", { exact: true })).toBeVisible();
});

test("dashboard shows recent job status and a result link", async ({ page }) => {
  await page.route("**/api/v1/capabilities", (route) => route.fulfill({ json: {
    succeeded: true, data: { enabledFeatures: ["setGenerationJobs"] },
  } }));
  await page.route("**/api/v1/jobs?*", (route) => route.fulfill({ json: { succeeded: true, data: {
    items: [{ id: "job-1", status: "succeeded", progress: 100,
      createdAt: "2026-11-15T10:00:00Z", resultSetId: "33333333-3333-4333-8333-333333333333" }],
    pageNumber: 1, pageSize: 10, totalCount: 1, totalPages: 1,
  } } }));
  await page.goto("/");
  const panel = page.getByRole("region", { name: "Recent jobs" });
  await expect(panel).toContainText("succeeded");
  await expect(panel).toContainText("100%");
  await expect(panel.getByRole("link", { name: "Open set" })).toHaveAttribute("href", "/builder/33333333-3333-4333-8333-333333333333");
});

test("recent jobs refreshes after a generated job succeeds", async ({ page }) => {
  await page.route("**/api/v1/capabilities", (route) => route.fulfill({ json: {
    succeeded: true, data: { enabledFeatures: ["setGenerationJobs"] },
  } }));
  let completed = false;
  await page.route("**/api/v1/jobs?*", (route) => route.fulfill({ json: { succeeded: true, data: {
    items: [{ id: "job-1", status: completed ? "succeeded" : "queued", progress: completed ? 100 : 0,
      createdAt: "2026-11-15T10:00:00Z", resultSetId: completed ? "33333333-3333-4333-8333-333333333333" : null }],
    pageNumber: 1, pageSize: 10, totalCount: 1, totalPages: 1,
  } } }));
  await page.route("**/api/v1/set-generation-jobs", (route) => route.fulfill({ status: 202, json: {
    succeeded: true, data: { id: "job-1", status: "queued", progress: 0 },
  } }));
  await page.route("**/api/v1/jobs/job-1", (route) => {
    completed = true;
    return route.fulfill({ json: { succeeded: true, data: {
      id: "job-1", status: "succeeded", progress: 100,
      resultSetId: "33333333-3333-4333-8333-333333333333",
    } } });
  });
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Recent jobs" })).toContainText("queued");
  await page.getByRole("link", { name: "Set Builder" }).click();
  await page.getByRole("button", { name: "Generate set", exact: true }).click();
  await expect(page).toHaveURL(/\/builder\//);
  await page.getByRole("link", { name: "Home" }).click();
  await expect(page.getByRole("region", { name: "Recent jobs" })).toContainText("succeeded");
});
