import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useBlocker } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  LockKeyhole,
  LockKeyholeOpen,
  Sparkles,
  X,
} from "lucide-react";
import type { DjSet, components } from "@mixpilot/api-client";
import { duration, setInput } from "@mixpilot/shared";
import { useSession } from "../../core/session";
import { SetExplanation } from "./SetExplanation";
import { PromptPreview } from "./PromptPreview";
import { useCapabilities } from "./useCapabilities";
import { useGenerationJob } from "./useGenerationJob";
import { ApprovalControls } from "./ApprovalControls";
import { Artwork, Empty, Failure, Field, Loading } from "../../components/ui";
type SetTrack = components["schemas"]["SetTrackResponse"];
type Requirements = components["schemas"]["SetRequirementsRequest"];
type BuilderForm = ReturnType<typeof setInput.parse> & { mood: string; hasVocals: boolean | null };
const initial = {
  name: "Evening flow",
  durationMinutes: 60,
  minBpm: 120,
  maxBpm: 126,
  genre: "",
  mood: "",
  hasVocals: null,
  territory: "HU",
  energyCurve: "gradualBuild" as const,
};

export function SetBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, identity } = useSession();
  const cache = useQueryClient();
  const [form, setForm] = useState<BuilderForm>(initial);
  const [validation, setValidation] = useState("");
  const capabilities = useCapabilities();
  const jobsEnabled = !!capabilities.data?.enabledFeatures?.includes("setGenerationJobs");
  const promptEnabled = !!capabilities.data?.enabledFeatures?.includes("promptInterpretation");
  const job = useGenerationJob();
  const result = useQuery({
    queryKey: [identity, "set", id],
    queryFn: ({ signal }) => api.set(id!, signal),
    enabled: !!id,
  });
  useEffect(() => {
    if (result.data?.requirements) {
      const r = result.data.requirements;
      setForm({
        name: result.data.name ?? "",
        durationMinutes: (r.durationSeconds ?? 3600) / 60,
        minBpm: r.minBpm ?? 110,
        maxBpm: r.maxBpm ?? 140,
        genre: r.genre ?? "",
        mood: r.mood ?? "",
        hasVocals: r.hasVocals ?? null,
        territory: r.territory,
        energyCurve: r.energyCurve ?? "gradualBuild",
      });
    }
  }, [result.data]);
  const generate = useMutation({
    mutationFn: () => {
      const parsed = setInput.safeParse(form);
      if (!parsed.success) {
        setValidation(
          parsed.error.issues.map((issue) => issue.message).join(" "),
        );
        return Promise.resolve(undefined);
      }
      setValidation("");
      const v = parsed.data;
      return api.generateSet({
        name: v.name,
        requirements: {
          durationSeconds: v.durationMinutes * 60,
          minBpm: v.minBpm,
          maxBpm: v.maxBpm,
          genre: v.genre || null,
          mood: form.mood || null,
          hasVocals: form.hasVocals,
          territory: v.territory,
          energyCurve: v.energyCurve,
          mode: "planning",
          excludedTrackIds: [],
        },
      });
    },
    onSuccess: async (data) => {
      if (data) {
        cache.setQueryData([identity, "set", data.id], data);
        await cache.invalidateQueries({ queryKey: [identity, "sets"] });
        navigate(`/builder/${data.id}`);
      }
    },
  });
  const requirements: Requirements = {
    durationSeconds: form.durationMinutes * 60,
    minBpm: form.minBpm,
    maxBpm: form.maxBpm,
    genre: form.genre || null,
    mood: form.mood || null,
    hasVocals: form.hasVocals,
    territory: form.territory,
    energyCurve: form.energyCurve,
    mode: "planning",
    excludedTrackIds: [],
  };
  const submit = () => {
    if (!jobsEnabled) { generate.mutate(); return; }
    const parsed = setInput.safeParse(form);
    if (!parsed.success) {
      setValidation(parsed.error.issues.map((issue) => issue.message).join(" "));
      return;
    }
    setValidation("");
    job.submit({ name: parsed.data.name, requirements });
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">FROM INSPIRATION TO YOUR NEXT SET</p>
          <h1>
            <Sparkles size={28} /> AI Set Builder
          </h1>
          <p>Shape the journey. Find the flow. Make it yours.</p>
        </div>
        <span className="pill">Personal library</span>
      </div>
      {promptEnabled && <PromptPreview territory={form.territory} onPreview={(preview) => {
        const r = preview.requirements;
        if (!r) return;
        setForm((current) => ({ ...current,
          durationMinutes: (r.durationSeconds ?? current.durationMinutes * 60) / 60,
          minBpm: r.minBpm ?? current.minBpm,
          maxBpm: r.maxBpm ?? current.maxBpm,
          genre: r.genre ?? "",
          mood: r.mood ?? "",
          hasVocals: r.hasVocals ?? null,
          energyCurve: r.energyCurve ?? current.energyCurve,
          territory: r.territory,
        }));
      }} />}
      <form
        className="builder-controls"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Field label="Set name">
          <input
            required
            maxLength={150}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Mood">
          <input placeholder="Any mood" maxLength={100} value={form.mood}
            onChange={(e) => setForm({ ...form, mood: e.target.value })} />
        </Field>
        <Field label="Vocals">
          <select value={form.hasVocals == null ? "" : String(form.hasVocals)}
            onChange={(e) => setForm({ ...form, hasVocals: e.target.value === "" ? null : e.target.value === "true" })}>
            <option value="">No preference</option>
            <option value="true">With vocals</option>
            <option value="false">Instrumental</option>
          </select>
        </Field>
        <Field label="Genre">
          <input
            placeholder="Any genre"
            maxLength={100}
            value={form.genre}
            onChange={(e) => setForm({ ...form, genre: e.target.value })}
          />
        </Field>
        <Field label="Duration (minutes)">
          <input
            type="number"
            min={1}
            max={480}
            required
            value={form.durationMinutes}
            onChange={(e) =>
              setForm({ ...form, durationMinutes: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Minimum BPM">
          <input
            type="number"
            min={20}
            max={300}
            step="any"
            required
            value={form.minBpm}
            onChange={(e) =>
              setForm({ ...form, minBpm: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Maximum BPM">
          <input
            type="number"
            min={20}
            max={300}
            step="any"
            required
            value={form.maxBpm}
            onChange={(e) =>
              setForm({ ...form, maxBpm: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Energy curve">
          <select
            value={form.energyCurve}
            onChange={(e) =>
              setForm({
                ...form,
                energyCurve: e.target.value as typeof form.energyCurve,
              })
            }
          >
            <option value="gradualBuild">Progressive build</option>
            <option value="wave">Wave</option>
            <option value="peakAndCooldown">Peak & cooldown</option>
            <option value="highEnergy">High energy</option>
            <option value="warmUp">Warm-up</option>
          </select>
        </Field>
        <Field label="Territory">
          <input
            value={form.territory}
            pattern="[A-Z]{2}"
            required
            maxLength={2}
            onChange={(e) =>
              setForm({ ...form, territory: e.target.value.toUpperCase() })
            }
          />
        </Field>
        <button className="primary" disabled={generate.isPending || job.isActive}>
          <Sparkles size={17} />
          {generate.isPending || job.isActive
            ? "Building your set…"
            : id
              ? "Generate new set"
              : "Generate set"}
        </button>
      </form>
      <p className="muted caption">
        Track selection uses BPM, key, energy and your constraints. Generating a
        set saves its first version.
      </p>
      {validation && (
        <p className="error" role="alert">
          {validation}
        </p>
      )}
      <Failure error={generate.error} />
      <Failure error={job.error} />
      {jobsEnabled && job.job && <section className="explanation" aria-live="polite">
        <h2>Generation job</h2>
        <p>Status: {job.job.status ?? "queued"} · Progress: {job.job.progress ?? 0}%</p>
        {job.failureMessage && <p className="error" role="alert">{job.failureMessage}</p>}
        {job.timedOut && <p role="status">Still running; check Recent jobs on the dashboard.</p>}
        {job.notice && <p role="status">{job.notice}</p>}
        {job.canCancel && !job.timedOut && <button onClick={() => job.cancel()}>Cancel job</button>}
      </section>}
      <Failure error={result.error} retry={() => void result.refetch()} />
      {id && result.isPending && <Loading />}
      {result.data ? (
        <SetEditor
          key={`${result.data.id}:${result.data.revision}`}
          value={result.data}
          requirements={requirements}
          reload={() => void result.refetch()}
        />
      ) : (
        !id && (
          <Empty title="Every great set starts with a direction">
            Choose your constraints above. Tracks need BPM and energy metadata
            to be considered for a set.
          </Empty>
        )
      )}
    </>
  );
}

function SetEditor({
  value,
  requirements,
  reload,
}: {
  value: DjSet;
  requirements: Requirements;
  reload: () => void;
}) {
  const { api, identity } = useSession();
  const cache = useQueryClient();
  const [tracks, setTracks] = useState(value.tracks ?? []);
  const [tab, setTab] = useState("preview");
  const [active, setActive] = useState(0);
  const [history, setHistory] = useState<number>();
  const [search, setSearch] = useState("");
  const versions = useQuery({
    queryKey: [identity, "versions", value.id],
    queryFn: ({ signal }) => api.versions(value.id!, signal),
  });
  const historical = useQuery({
    queryKey: [identity, "version", value.id, history],
    queryFn: ({ signal }) => api.version(value.id!, history!, signal),
    enabled: history != null,
  });
  const candidates = useQuery({
    queryKey: [identity, "tracks", "add-to-set", search],
    queryFn: ({ signal }) => api.tracks({ search, pageSize: 10 }, signal),
    enabled: search.length >= 2,
  });
  const changed = JSON.stringify(tracks) !== JSON.stringify(value.tracks ?? []);
  const blocker = useBlocker(changed);
  useEffect(() => {
    if (blocker.state === "blocked") {
      if (window.confirm("Leave this set and discard unsaved changes?"))
        blocker.proceed();
      else blocker.reset();
    }
  }, [blocker]);
  const accept = async (updated: DjSet) => {
    cache.setQueryData([identity, "set", value.id], updated);
    await Promise.all([
      cache.invalidateQueries({ queryKey: [identity, "sets"] }),
      cache.invalidateQueries({ queryKey: [identity, "versions", value.id] }),
    ]);
  };
  const save = useMutation({
    mutationFn: () =>
      api.editSet(value.id!, {
        expectedRevision: value.revision!,
        orderedTrackIds: tracks.map((t) => t.trackId!),
        lockedTrackIds: tracks.filter((t) => t.isLocked).map((t) => t.trackId!),
      }),
    onSuccess: accept,
  });
  const regenerate = useMutation({
    mutationFn: () =>
      api.regenerateSet(value.id!, {
        expectedRevision: value.revision!,
        requirements,
      }),
    onSuccess: accept,
  });
  const busy = save.isPending || regenerate.isPending;
  const displayed = history != null ? (historical.data?.tracks ?? []) : tracks;
  const selected = displayed[active] ?? displayed[0];
  const move = (index: number, step: number) =>
    setTracks((previous) => {
      const next = [...previous];
      const target = index + step;
      if (!next[index] || !next[target]) return previous;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  useEffect(() => {
    if (!changed) return;
    const guard = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [changed]);
  return (
    <div className="builder-layout">
      <section className="set-main">
        <div className="section-heading">
          <div>
            <h2>{value.name}</h2>
            <p>
              {displayed.length} tracks ·{" "}
              {duration(
                displayed.reduce((sum, t) => sum + (t.durationSeconds ?? 0), 0),
              )}{" "}
              · Version {history ?? value.version}
              {changed && history == null ? " · Unsaved changes" : ""}
              {" · "}{value.status ?? "draft"}{" · Approved version: "}{value.approvedVersion ?? "none"}
            </p>
          </div>
          <select
            aria-label="Set version"
            value={history ?? ""}
            disabled={changed || busy}
            onChange={(e) => {
              setHistory(e.target.value ? Number(e.target.value) : undefined);
              setActive(0);
            }}
          >
            <option value="">Latest version</option>
            {versions.data?.map((v) => (
              <option key={v.version} value={v.version}>
                Version {v.version} · {v.status ?? "draft"}
              </option>
            ))}
          </select>
        </div>
        <Failure error={versions.error} />
        <ApprovalControls set={value}
          version={versions.data?.find((v) => v.version === (history ?? value.version))}
          disabled={changed || busy} onApproved={accept} reload={reload} />
        <Failure error={historical.error} />
        {history != null && historical.isPending && <Loading />}
        <div className="tabs" role="tablist" aria-label="Set analysis">
          {[
            ["preview", "Set preview"],
            ["energy", "Energy flow"],
            ["bpm", "BPM analysis"],
            ["key", "Key analysis"],
          ].map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key!)}
            >
              {label}
            </button>
          ))}
        </div>
        {(history != null ? historical.data?.warnings : value.warnings)?.map(
          (w) => (
            <p key={w} className="notice">
              {w}
            </p>
          ),
        )}
        {history == null && (
          <div className="toolbar compact">
            <button
              className="primary"
              disabled={!changed || busy || tracks.length === 0}
              onClick={() => save.mutate()}
            >
              {save.isPending ? "Saving…" : "Save changes"}
            </button>
            <button
              disabled={
                changed ||
                busy ||
                !setInput.safeParse({
                  name: value.name,
                  durationMinutes: (requirements.durationSeconds ?? 0) / 60,
                  ...requirements,
                  genre: requirements.genre ?? "",
                }).success
              }
              onClick={() => regenerate.mutate()}
            >
              {regenerate.isPending ? "Regenerating…" : "Regenerate unlocked"}
            </button>
            {changed && (
              <button
                disabled={busy}
                onClick={() => setTracks(value.tracks ?? [])}
              >
                Discard changes
              </button>
            )}
          </div>
        )}
        <Failure error={save.error || regenerate.error} retry={reload} />
        {tab === "preview" ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Track</th>
                  <th>BPM</th>
                  <th>Key</th>
                  <th>Energy</th>
                  <th>Compatibility</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((t, i) => (
                  <tr
                    key={t.trackId}
                    className={
                      selected?.trackId === t.trackId ? "active-row" : ""
                    }
                  >
                    <td>{String(i + 1).padStart(2, "0")}</td>
                    <td>
                      <button
                        className="track-link"
                        onClick={() => setActive(i)}
                      >
                        <Artwork title={t.title} />
                        <span>
                          <strong>{t.title}</strong>
                          <small>{t.artist}</small>
                        </span>
                      </button>
                    </td>
                    <td>{t.bpm ?? "—"}</td>
                    <td>
                      <span className="key-badge">{t.musicalKey ?? "—"}</span>
                    </td>
                    <td>{t.energy ?? "—"}</td>
                    <td>
                      {changed && history == null
                        ? "Pending save"
                        : t.compatibility == null
                          ? "—"
                          : `${Math.round(t.compatibility * 100)}%`}
                    </td>
                    <td>
                      <div className="row-actions">
                        {history == null && (
                          <>
                            <button
                              aria-label={`Move ${t.title} up`}
                              disabled={busy || i === 0}
                              onClick={() => move(i, -1)}
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              aria-label={`Move ${t.title} down`}
                              disabled={busy || i === tracks.length - 1}
                              onClick={() => move(i, 1)}
                            >
                              <ArrowDown size={14} />
                            </button>
                            <button
                              aria-label={`${t.isLocked ? "Unlock" : "Lock"} ${t.title}`}
                              disabled={busy}
                              onClick={() =>
                                setTracks((previous) =>
                                  previous.map((v, index) =>
                                    index === i
                                      ? { ...v, isLocked: !v.isLocked }
                                      : v,
                                  ),
                                )
                              }
                            >
                              {t.isLocked ? (
                                <LockKeyhole size={14} />
                              ) : (
                                <LockKeyholeOpen size={14} />
                              )}
                            </button>
                            <button
                              aria-label={`Remove ${t.title} from set`}
                              disabled={busy || tracks.length <= 1}
                              onClick={() =>
                                setTracks((previous) =>
                                  previous.filter((_, index) => index !== i),
                                )
                              }
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <MetadataChart tracks={displayed} kind={tab} />
        )}
        {history == null && (
          <div className="add-track">
            <Field label="Add or replace a track">
              <input
                placeholder="Search your library (2+ characters)"
                value={search}
                maxLength={200}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Field>
            <Failure error={candidates.error} />
            {search.length >= 2 &&
              candidates.data?.items
                ?.filter((t) => !tracks.some((v) => v.trackId === t.id))
                .map((t) => (
                  <button
                    key={t.id}
                    disabled={busy || tracks.length >= 200}
                    onClick={() => {
                      setTracks((previous) => [
                        ...previous,
                        {
                          trackId: t.id,
                          title: t.title,
                          artist: t.artist,
                          durationSeconds: t.durationSeconds,
                          bpm: t.bpm,
                          musicalKey: t.musicalKey,
                          energy: t.energy,
                          isLocked: false,
                          reasons: [],
                        },
                      ]);
                      setSearch("");
                    }}
                  >
                    {t.artist} — {t.title} · Add
                  </button>
                ))}
            <p className="muted caption">
              To replace a track, add its replacement and remove the original.
              Saving validates the updated order against your set requirements.
            </p>
          </div>
        )}
      </section>
      <aside className="track-panel">
        <p className="eyebrow">IN THE SPOTLIGHT</p>
        {selected ? (
          <>
            <Artwork large title={selected.title} />
            <h2>{selected.title}</h2>
            <p>{selected.artist}</p>
            <div className="stats">
              <div>
                <strong>{selected.bpm ?? "—"}</strong>
                <small>BPM</small>
              </div>
              <div>
                <strong>{selected.musicalKey ?? "—"}</strong>
                <small>KEY</small>
              </div>
              <div>
                <strong>{selected.energy ?? "—"}</strong>
                <small>ENERGY</small>
              </div>
            </div>
            <h3>Selection notes</h3>
            {changed ? (
              <p>Save your changes to refresh compatibility.</p>
            ) : (
              <ul className="reasons">
                {selected.reasons?.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
            <p className="muted caption">
              Compatibility is a planning score, not an audio transition
              measurement.
            </p>
            <span className="pill">
              Metadata only · {duration(selected.durationSeconds)}
            </span>
          </>
        ) : (
          <p>Select a track to explore its metadata.</p>
        )}
        <SetExplanation id={value.id!} disabled={changed || history != null} />
      </aside>
    </div>
  );
}
function MetadataChart({ tracks, kind }: { tracks: SetTrack[]; kind: string }) {
  if (kind === "key")
    return (
      <div className="key-flow">
        {tracks.map((t, i) => (
          <div key={t.trackId}>
            <small>{i + 1}</small>
            <span className="key-badge">{t.musicalKey ?? "Unknown"}</span>
            <p>{t.title}</p>
          </div>
        ))}
      </div>
    );
  const values = tracks.map((t) => (kind === "energy" ? t.energy : t.bpm));
  const known = values.filter((v): v is number => v != null);
  const min = kind === "energy" ? 0 : Math.min(...known) - 2;
  const max = kind === "energy" ? 10 : Math.max(...known) + 2;
  return (
    <figure className="chart">
      <figcaption>
        {kind === "energy" ? "Energy" : "BPM"} across the set · metadata values
      </figcaption>
      {known.length > 0 ? (
        <svg
          viewBox="0 0 600 200"
          role="img"
          aria-label={`${kind} across the set; exact values are listed below`}
        >
          <line x1="20" y1="180" x2="580" y2="180" stroke="#334155" />
          {values.map((v, i) =>
            v == null ? null : (
              <g key={i}>
                <line
                  x1={20 + (i * 560) / Math.max(1, values.length - 1)}
                  x2={20 + (i * 560) / Math.max(1, values.length - 1)}
                  y1={180}
                  y2={180 - ((v - min) / Math.max(1, max - min)) * 150}
                  stroke="#9663ff"
                  strokeWidth="5"
                />
                <circle
                  cx={20 + (i * 560) / Math.max(1, values.length - 1)}
                  cy={180 - ((v - min) / Math.max(1, max - min)) * 150}
                  r="5"
                  fill="#c8acff"
                />
              </g>
            ),
          )}
        </svg>
      ) : (
        <p>No values recorded.</p>
      )}
      <ol className="chart-values">
        {tracks.map((t, i) => (
          <li key={t.trackId}>
            {t.title}: {values[i] ?? "Unknown"}
          </li>
        ))}
      </ol>
    </figure>
  );
}
