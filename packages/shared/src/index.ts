import { z } from "zod";

export function duration(seconds: number | null | undefined) {
  if (seconds == null) return "Unknown";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

export const trackInput = z.object({
  title: z.string().trim().min(1).max(300),
  artist: z.string().trim().min(1).max(200),
  version: z.string().trim().max(200),
  durationSeconds: z.number().int().min(1).max(7200),
  bpm: z.number().min(20).max(300).nullable(),
  musicalKey: z
    .string()
    .regex(/^(?:[1-9]|1[0-2])[AB]$/)
    .nullable(),
  energy: z.number().int().min(1).max(10).nullable(),
  genre: z.string().trim().max(100),
  mood: z.string().trim().max(100),
  hasVocals: z.boolean().nullable(),
});
export const setInput = z
  .object({
    name: z.string().trim().min(1).max(150),
    durationMinutes: z.number().int().min(1).max(480),
    minBpm: z.number().min(20).max(300),
    maxBpm: z.number().min(20).max(300),
    genre: z.string().trim().max(100),
    territory: z.string().regex(/^[A-Z]{2}$/),
    energyCurve: z.enum([
      "gradualBuild",
      "wave",
      "peakAndCooldown",
      "highEnergy",
      "warmUp",
    ]),
  })
  .refine((v) => v.minBpm <= v.maxBpm, {
    path: ["maxBpm"],
    message: "Maximum BPM must be at least the minimum.",
  });

export const tokens = {
  background: "#090e19",
  surface: "#111827",
  border: "#293449",
  text: "#eef2ff",
  muted: "#a5b3cd",
  accent: "#9663ff",
} as const;
