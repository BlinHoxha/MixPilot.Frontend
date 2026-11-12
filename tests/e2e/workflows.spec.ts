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
