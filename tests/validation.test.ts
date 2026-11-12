import { expect, it } from "vitest";
import { duration, setInput, trackInput } from "../packages/shared/src/index";
const track = {
  title: "Midnight",
  artist: "Test Artist",
  version: "",
  durationSeconds: 300,
  bpm: null,
  musicalKey: null,
  energy: null,
  genre: "",
  mood: "",
  hasVocals: null,
};
it("preserves unknown analysis values instead of inventing zeroes", () => {
  expect(trackInput.parse(track).bpm).toBeNull();
  expect(duration(undefined)).toBe("Unknown");
});
it("rejects invalid Camelot keys and fractional energy", () => {
  expect(trackInput.safeParse({ ...track, musicalKey: "13A" }).success).toBe(
    false,
  );
  expect(trackInput.safeParse({ ...track, energy: 4.5 }).success).toBe(false);
});
it("rejects inverted BPM constraints before submission", () => {
  expect(
    setInput.safeParse({
      name: "My set",
      durationMinutes: 60,
      minBpm: 130,
      maxBpm: 120,
      genre: "",
      territory: "HU",
      energyCurve: "gradualBuild",
    }).success,
  ).toBe(false);
});
it("formats seconds consistently for both clients", () => {
  expect(duration(438)).toBe("7:18");
  expect(duration(0)).toBe("0:00");
});
