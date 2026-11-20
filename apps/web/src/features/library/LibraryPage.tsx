import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Upload,
  ListPlus,
  SlidersHorizontal,
} from "lucide-react";
import { ApiError } from "@mixpilot/api-client";
import type { Track, TrackQuery } from "@mixpilot/api-client";
import { duration, trackInput } from "@mixpilot/shared";
import { useSession } from "../../core/session";
import {
  Artwork,
  Empty,
  Failure,
  Field,
  Loading,
  Modal,
  Pagination,
} from "../../components/ui";

export function LibraryPage() {
  const { api, identity } = useSession();
  const cache = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState<TrackQuery["sortBy"]>("createdAt");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<string>();
  const [modal, setModal] = useState<
    "create" | "import" | "collection" | "edit"
  >();
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const tracks = useQuery({
    queryKey: [identity, "tracks", page, debounced, genre, sort],
    queryFn: ({ signal }) =>
      api.tracks(
        {
          pageNumber: page,
          pageSize: 20,
          search: debounced || undefined,
          genre: genre || undefined,
          sortBy: sort,
          direction: sort === "createdAt" ? "desc" : "asc",
        },
        signal,
      ),
  });
  const track = useQuery({
    queryKey: [identity, "track", detail],
    queryFn: ({ signal }) => api.track(detail!, signal),
    enabled: !!detail,
  });
  const refresh = async () => {
    await Promise.all([
      cache.invalidateQueries({ queryKey: [identity, "tracks"] }),
      cache.invalidateQueries({ queryKey: [identity, "track"] }),
      cache.invalidateQueries({ queryKey: [identity, "collections"] }),
    ]);
  };
  const remove = useMutation({
    mutationFn: (value: Track) => api.deleteTrack(value.id!, value.revision!),
    onSuccess: async () => {
      setSelected(new Set());
      setDetail(undefined);
      await refresh();
    },
  });
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR SOUND, ORGANIZED</p>
          <h1>
            My Library{" "}
            <span className="count">{tracks.data?.totalCount ?? "—"}</span>
          </h1>
          <p>A home for the tracks that make your sets.</p>
        </div>
        <div className="actions">
          <button onClick={() => setModal("import")}>
            <Upload size={16} /> Import CSV
          </button>
          <button className="primary" onClick={() => setModal("create")}>
            <Plus size={16} /> Add track
          </button>
        </div>
      </div>
      <div className="toolbar">
        <label className="search">
          <Search size={17} />
          <input
            aria-label="Search library"
            placeholder="Search tracks or artists…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={200}
          />
        </label>
        <label className="inline-label">
          <SlidersHorizontal size={16} />
          <input
            aria-label="Genre filter"
            placeholder="Exact genre"
            value={genre}
            maxLength={100}
            onChange={(e) => {
              setGenre(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <select
          aria-label="Sort tracks"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as TrackQuery["sortBy"]);
            setPage(1);
          }}
        >
          <option value="createdAt">Recently added</option>
          <option value="title">Title A–Z</option>
          <option value="artist">Artist A–Z</option>
          <option value="bpm">BPM ascending</option>
        </select>
      </div>
      {selected.size > 0 && (
        <div className="selection">
          <span>{selected.size} selected</span>
          <button onClick={() => setModal("collection")}>
            <ListPlus size={16} /> Create playlist
          </button>
          <button onClick={() => setSelected(new Set())}>
            Clear selection
          </button>
        </div>
      )}
      <Failure error={tracks.error} retry={() => void tracks.refetch()} />
      {tracks.isPending ? (
        <Loading />
      ) : tracks.data?.items?.length ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>
                  <span className="sr-only">Select</span>
                </th>
                <th>Track / Artist</th>
                <th>BPM</th>
                <th>Key</th>
                <th>Energy</th>
                <th>Genre</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {tracks.data.items.map((value) => (
                <tr
                  key={value.id}
                  className={detail === value.id ? "active-row" : ""}
                >
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select ${value.title}`}
                      checked={selected.has(value.id!)}
                      onChange={(e) =>
                        setSelected((previous) => {
                          const next = new Set(previous);
                          if (e.target.checked) next.add(value.id!);
                          else next.delete(value.id!);
                          return next;
                        })
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="track-link"
                      onClick={() => {
                        setDetail(value.id);
                        remove.reset();
                      }}
                    >
                      <Artwork title={value.title} />
                      <span>
                        <strong>{value.title}</strong>
                        <small>
                          {value.artist}
                          {value.version ? ` · ${value.version}` : ""}
                        </small>
                      </span>
                    </button>
                  </td>
                  <td>{value.bpm ?? "—"}</td>
                  <td>
                    <span className="key-badge">{value.musicalKey ?? "—"}</span>
                  </td>
                  <td>
                    <div className="energy">
                      <meter
                        min={0}
                        max={10}
                        value={value.energy ?? 0}
                        aria-label={`${value.title} energy`}
                      />
                      <span>{value.energy ?? "—"}</span>
                    </div>
                  </td>
                  <td>{value.genre || "—"}</td>
                  <td>{duration(value.durationSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !tracks.error && (
          <Empty
            title={
              search || genre
                ? "No matching tracks"
                : "Make room for your sound"
            }
          >
            {search || genre
              ? "Try a different search or genre."
              : "Add track metadata or import your library from a CSV file to build your first set."}
          </Empty>
        )
      )}
      <Pagination
        page={page}
        pages={tracks.data?.totalPages ?? 1}
        change={setPage}
      />
      {detail && (
        <Modal title="Track details" close={() => setDetail(undefined)}>
          {track.isPending ? (
            <Loading />
          ) : (
            track.data && (
              <>
                <Artwork title={track.data.title} large />
                <h2>{track.data.title}</h2>
                <p>{track.data.artist}</p>
                <div className="stats">
                  <div>
                    <strong>{track.data.bpm ?? "—"}</strong>
                    <small>BPM</small>
                  </div>
                  <div>
                    <strong>{track.data.musicalKey ?? "—"}</strong>
                    <small>KEY</small>
                  </div>
                  <div>
                    <strong>{track.data.energy ?? "—"}</strong>
                    <small>ENERGY</small>
                  </div>
                  <div>
                    <strong>{duration(track.data.durationSeconds)}</strong>
                    <small>DURATION</small>
                  </div>
                </div>
                <p>
                  {[track.data.genre, track.data.mood]
                    .filter(Boolean)
                    .join(" · ") || "No genre or mood recorded."}
                </p>
                <p className="notice">
                  Library metadata · Audio playback and analysis are not
                  available yet.
                </p>
                <Failure
                  error={remove.error}
                  retry={
                    remove.error && !(remove.error instanceof ApiError && remove.error.code === "resource_in_use")
                      ? () => {
                          void track.refetch();
                          remove.reset();
                        }
                      : undefined
                  }
                />
                <div className="actions">
                  <button onClick={() => setModal("edit")}>
                    Edit metadata
                  </button>
                  <button
                    className="danger"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Remove “${track.data!.title}” from your library?`,
                        )
                      )
                        remove.mutate(track.data!);
                    }}
                  >
                    {remove.isPending ? "Removing…" : "Remove track"}
                  </button>
                </div>
              </>
            )
          )}
          <Failure error={track.error} retry={() => void track.refetch()} />
        </Modal>
      )}
      {(modal === "create" || modal === "edit") && (
        <TrackForm
          key={modal === "edit" ? track.data?.revision : "new"}
          value={modal === "edit" ? track.data : undefined}
          close={() => setModal(undefined)}
          saved={async () => {
            setModal(undefined);
            await refresh();
          }}
        />
      )}
      {modal === "import" && (
        <ImportForm close={() => setModal(undefined)} saved={refresh} />
      )}
      {modal === "collection" && (
        <CollectionForm
          ids={[...selected]}
          close={() => setModal(undefined)}
          saved={async () => {
            setModal(undefined);
            setSelected(new Set());
            await refresh();
          }}
        />
      )}
    </>
  );
}

function TrackForm({
  value,
  close,
  saved,
}: {
  value?: Track;
  close: () => void;
  saved: () => Promise<void>;
}) {
  const { api } = useSession();
  const [validation, setValidation] = useState("");
  const mutation = useMutation({
    mutationFn: async (form: FormData) => {
      const text = (key: string) => String(form.get(key) ?? "").trim();
      const number = (key: string) =>
        text(key) === "" ? null : Number(text(key));
      const parsed = trackInput.safeParse({
        title: text("title"),
        artist: text("artist"),
        version: text("version"),
        durationSeconds: Number(text("durationSeconds")),
        bpm: number("bpm"),
        musicalKey: text("musicalKey") || null,
        energy: number("energy"),
        genre: text("genre"),
        mood: text("mood"),
        hasVocals:
          text("hasVocals") === "" ? null : text("hasVocals") === "true",
      });
      if (!parsed.success) {
        setValidation(parsed.error.issues.map((v) => v.message).join(" "));
        return false;
      }
      setValidation("");
      if (value)
        await api.updateTrack(value.id!, {
          ...parsed.data,
          expectedRevision: value.revision!,
          keepDuplicate: false,
        });
      else
        await api.createTrack({
          ...parsed.data,
          authorizationConfirmed: form.get("authorization") === "on",
          keepDuplicate: false,
        });
      return true;
    },
    onSuccess: async (success) => {
      if (success) await saved();
    },
  });
  return (
    <Modal title={value ? "Edit track metadata" : "Add a track"} close={close}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(new FormData(e.currentTarget));
        }}
      >
        <div className="form-grid">
          <Field label="Track title">
            <input
              name="title"
              required
              maxLength={300}
              defaultValue={value?.title}
            />
          </Field>
          <Field label="Artist">
            <input
              name="artist"
              required
              maxLength={200}
              defaultValue={value?.artist}
            />
          </Field>
          <Field label="Version / mix">
            <input
              name="version"
              maxLength={200}
              defaultValue={value?.version}
            />
          </Field>
          <Field label="Duration (seconds)">
            <input
              name="durationSeconds"
              type="number"
              required
              min={1}
              max={7200}
              defaultValue={value?.durationSeconds}
            />
          </Field>
          <Field label="BPM (optional)">
            <input
              name="bpm"
              type="number"
              min={20}
              max={300}
              step="any"
              defaultValue={value?.bpm ?? ""}
            />
          </Field>
          <Field label="Camelot key (optional)">
            <input
              name="musicalKey"
              placeholder="8A"
              pattern="([1-9]|1[0-2])[AB]"
              defaultValue={value?.musicalKey ?? ""}
            />
          </Field>
          <Field label="Energy (1–10)">
            <input
              name="energy"
              type="number"
              min={1}
              max={10}
              defaultValue={value?.energy ?? ""}
            />
          </Field>
          <Field label="Genre">
            <input name="genre" maxLength={100} defaultValue={value?.genre} />
          </Field>
          <Field label="Mood">
            <input name="mood" maxLength={100} defaultValue={value?.mood} />
          </Field>
          <Field label="Vocals">
            <select
              name="hasVocals"
              defaultValue={
                value?.hasVocals == null ? "" : String(value.hasVocals)
              }
            >
              <option value="">Unknown</option>
              <option value="true">With vocals</option>
              <option value="false">Instrumental</option>
            </select>
          </Field>
        </div>
        {!value && (
          <label className="checkbox">
            <input name="authorization" type="checkbox" required /> I am
            authorized to register this track in my personal library.
          </label>
        )}
        {validation && (
          <p role="alert" className="error">
            {validation}
          </p>
        )}
        <Failure error={mutation.error} />
        {mutation.error instanceof ApiError &&
          mutation.error.status === 409 &&
          value && (
            <button type="button" onClick={() => void saved()}>
              Reload latest (discard edits)
            </button>
          )}
        <div className="actions">
          <button type="button" onClick={close}>
            Cancel
          </button>
          <button className="primary" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save track"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ImportForm({
  close,
  saved,
}: {
  close: () => void;
  saved: () => Promise<void>;
}) {
  const { api } = useSession();
  const [csv, setCsv] = useState("");
  const [fileError, setFileError] = useState("");
  const mutation = useMutation({
    mutationFn: (authorized: boolean) =>
      api.importCsv({ csv, authorizationConfirmed: authorized }),
    onSuccess: saved,
  });
  return (
    <Modal title="Import library metadata" close={close}>
      <p>CSV imports register metadata. Audio files are not uploaded.</p>
      <p className="muted">
        Up to 500 rows. Headers: Artist, Title, Version, DurationSeconds, Bpm,
        MusicalKey, Energy, Genre, Mood, HasVocals.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(
            new FormData(e.currentTarget).get("authorization") === "on",
          );
        }}
      >
        <Field label="Choose CSV file">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 1000000) {
                setFileError("Choose a file smaller than 1 MB.");
                setCsv("");
                return;
              }
              try {
                const content = await file.text();
                if (content.length > 500000) {
                  setFileError("CSV content exceeds 500,000 characters.");
                  setCsv("");
                  return;
                }
                setFileError("");
                setCsv(content);
                mutation.reset();
              } catch {
                setFileError("Could not read the file.");
                setCsv("");
              }
            }}
          />
        </Field>
        <label className="checkbox">
          <input name="authorization" type="checkbox" required /> I am
          authorized to register these personal-library tracks.
        </label>
        {fileError && (
          <p role="alert" className="error">
            {fileError}
          </p>
        )}
        <Failure error={mutation.error} />
        {mutation.data && (
          <p role="status" className="success">
            Imported {mutation.data.createdCount} tracks. Skipped{" "}
            {mutation.data.skippedDuplicateCount} duplicates.
          </p>
        )}
        <div className="actions">
          <button type="button" onClick={close}>
            Close
          </button>
          <button className="primary" disabled={!csv || mutation.isPending}>
            {mutation.isPending ? "Importing…" : "Import tracks"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function CollectionForm({
  ids,
  close,
  saved,
}: {
  ids: string[];
  close: () => void;
  saved: () => Promise<void>;
}) {
  const { api } = useSession();
  const mutation = useMutation({
    mutationFn: (name: string) =>
      api.createCollection({ name, trackIds: ids, expectedRevision: 0 }),
    onSuccess: saved,
  });
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate(String(new FormData(e.currentTarget).get("name")).trim());
  };
  return (
    <Modal title="Create playlist" close={close}>
      <form onSubmit={submit}>
        <p>{ids.length} selected tracks</p>
        <Field label="Playlist name">
          <input name="name" required maxLength={150} />
        </Field>
        <Failure error={mutation.error} />
        <button className="primary" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Create playlist"}
        </button>
      </form>
    </Modal>
  );
}
