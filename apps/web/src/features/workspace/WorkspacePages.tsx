import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Library, ListMusic, Sparkles } from "lucide-react";
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
import { ApiError } from "@mixpilot/api-client";
import type { Collection } from "@mixpilot/api-client";
import { RecentJobs } from "./RecentJobs";

export function DashboardPage() {
  const { api, identity, name } = useSession();
  const tracks = useQuery({
    queryKey: [identity, "tracks", "dashboard"],
    queryFn: ({ signal }) =>
      api.tracks(
        { pageSize: 5, sortBy: "createdAt", direction: "desc" },
        signal,
      ),
  });
  const sets = useQuery({
    queryKey: [identity, "sets", 1],
    queryFn: ({ signal }) => api.sets(1, signal),
  });
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">WELCOME TO YOUR WORKSPACE</p>
          <h1>Find your next flow.</h1>
          <p>Good to see you, {name}.</p>
        </div>
      </div>
      <section className="hero">
        <div>
          <span className="pill">MADE FOR YOUR NEXT MOMENT</span>
          <h2>
            A great set is
            <br />
            more than a playlist.
          </h2>
          <p>
            Turn your library into a journey.
            <br />
            Build around tempo, key and energy.
          </p>
          <Link className="button primary" to="/builder">
            <Sparkles size={18} /> Build a set <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="orb" aria-hidden="true">
          <div />
          <div />
          <div />
        </div>
      </section>
      <div className="dashboard-grid">
        <Link className="quick-card" to="/library">
          <Library />
          <h3>Your library</h3>
          <p>{tracks.data?.totalCount ?? "—"} tracks ready to explore</p>
        </Link>
        <Link className="quick-card" to="/sets">
          <ListMusic />
          <h3>Saved sets</h3>
          <p>{sets.data?.totalCount ?? "—"} journeys in the making</p>
        </Link>
      </div>
      <RecentJobs />
      <div className="section-heading">
        <h2>Recently added</h2>
        <Link to="/library">View library →</Link>
      </div>
      <Failure error={tracks.error} retry={() => void tracks.refetch()} />
      <Failure error={sets.error} />
      {tracks.isPending ? (
        <Loading />
      ) : tracks.data?.items?.length ? (
        <div className="recent-grid">
          {tracks.data.items.map((t) => (
            <Link to="/library" className="recent-card" key={t.id}>
              <Artwork title={t.title} large />
              <h3>{t.title}</h3>
              <p>{t.artist}</p>
              <span className="muted">
                {t.bpm ?? "—"} BPM · {t.musicalKey ?? "Unknown key"}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        !tracks.error && (
          <Empty title="Your collection starts here">
            Add tracks to your library and your latest additions will appear
            here.
          </Empty>
        )
      )}
    </>
  );
}

export function SavedSetsPage() {
  const { api, identity } = useSession();
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: [identity, "sets", page],
    queryFn: ({ signal }) => api.sets(page, signal),
  });
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">KEEP THE MOMENT</p>
          <h1>Saved sets</h1>
          <p>Pick up where you left off.</p>
        </div>
        <Link className="button primary" to="/builder">
          Build a new set
        </Link>
      </div>
      <Failure error={query.error} retry={() => void query.refetch()} />
      {query.isPending ? (
        <Loading />
      ) : query.data?.items?.length ? (
        <div className="card-grid">
          {query.data.items.map((set) => (
            <Link className="quick-card" key={set.id} to={`/builder/${set.id}`}>
              <Sparkles />
              <h2>{set.name}</h2>
              <p>Revision {set.revision}</p>
              <small>
                Updated{" "}
                {set.updatedAt
                  ? new Date(set.updatedAt).toLocaleDateString()
                  : "—"}
              </small>
            </Link>
          ))}
        </div>
      ) : (
        !query.error && (
          <Empty title="Your first set is waiting">
            Build a set from your library. It will be saved here automatically.
          </Empty>
        )
      )}
      <Pagination
        page={page}
        pages={query.data?.totalPages ?? 1}
        change={setPage}
      />
    </>
  );
}

export function PlaylistsPage() {
  const { api, identity } = useSession();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Collection>();
  const query = useQuery({
    queryKey: [identity, "collections", page],
    queryFn: ({ signal }) => api.collections(page, signal),
  });
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">COLLECT YOUR INSPIRATION</p>
          <h1>Playlists</h1>
          <p>Select tracks in your library to create an ordered collection.</p>
        </div>
        <Link className="button primary" to="/library">
          Go to library
        </Link>
      </div>
      <Failure error={query.error} retry={() => void query.refetch()} />
      {query.isPending ? (
        <Loading />
      ) : query.data?.items?.length ? (
        <div className="card-grid">
          {query.data.items.map((item) => (
            <button
              className="quick-card"
              key={item.id}
              onClick={() => setSelected(item)}
            >
              <ListMusic />
              <h2>{item.name}</h2>
              <p>{item.trackIds?.length ?? 0} tracks</p>
            </button>
          ))}
        </div>
      ) : (
        !query.error && (
          <Empty title="A place for every mood">
            Create your first playlist from selected library tracks.
          </Empty>
        )
      )}
      <Pagination
        page={page}
        pages={query.data?.totalPages ?? 1}
        change={setPage}
      />
      {selected && (
        <Modal
          title={selected.name ?? "Playlist"}
          close={() => setSelected(undefined)}
        >
          <ol className="playlist-tracks">
            {selected.trackIds?.map((id) => (
              <PlaylistTrack key={id} id={id} />
            ))}
          </ol>
        </Modal>
      )}
    </>
  );
}
function PlaylistTrack({ id }: { id: string }) {
  const { api, identity } = useSession();
  const query = useQuery({
    queryKey: [identity, "track", id],
    queryFn: ({ signal }) => api.track(id, signal),
  });
  return (
    <li>
      {query.isPending ? (
        "Loading track…"
      ) : query.error ? (
        <Failure error={query.error} />
      ) : (
        <>
          <strong>{query.data?.title}</strong>
          <span> — {query.data?.artist}</span>
        </>
      )}
    </li>
  );
}

export function SettingsPage() {
  const { api, identity } = useSession();
  const cache = useQueryClient();
  const query = useQuery({
    queryKey: [identity, "profile"],
    queryFn: ({ signal }) => api.profile(signal),
  });
  const mutation = useMutation({
    mutationFn: (form: FormData) =>
      api.saveProfile({
        displayName: String(form.get("displayName")).trim(),
        preferredGenre: String(form.get("genre")).trim(),
        minBpm: Number(form.get("minBpm")),
        maxBpm: Number(form.get("maxBpm")),
        expectedRevision: query.data?.revision ?? 0,
        preferVocals:
          form.get("vocals") === "" ? null : form.get("vocals") === "true",
      }),
    onSuccess: (data) => cache.setQueryData([identity, "profile"], data),
  });
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">MAKE IT YOURS</p>
          <h1>DJ preferences</h1>
          <p>Your profile and musical preferences.</p>
        </div>
      </div>
      <Failure
        error={
          query.error instanceof ApiError && query.error.status === 404
            ? null
            : query.error
        }
        retry={() => void query.refetch()}
      />
      {query.isPending ? (
        <Loading />
      ) : (
        (query.data ||
          (query.error instanceof ApiError && query.error.status === 404)) && (
          <form
            className="settings-card"
            key={query.data?.revision ?? 0}
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate(new FormData(e.currentTarget));
            }}
          >
            <Field label="Display name">
              <input
                name="displayName"
                required
                maxLength={100}
                defaultValue={query.data?.displayName}
              />
            </Field>
            <Field label="Preferred genre">
              <input
                name="genre"
                maxLength={100}
                defaultValue={query.data?.preferredGenre}
              />
            </Field>
            <div className="form-grid">
              <Field label="Minimum BPM">
                <input
                  name="minBpm"
                  type="number"
                  required
                  min={20}
                  max={300}
                  step="any"
                  defaultValue={query.data?.minBpm ?? 110}
                />
              </Field>
              <Field label="Maximum BPM">
                <input
                  name="maxBpm"
                  type="number"
                  required
                  min={20}
                  max={300}
                  step="any"
                  defaultValue={query.data?.maxBpm ?? 140}
                />
              </Field>
            </div>
            <Field label="Vocal preference">
              <select
                name="vocals"
                defaultValue={
                  query.data?.preferVocals == null
                    ? ""
                    : String(query.data.preferVocals)
                }
              >
                <option value="">No preference</option>
                <option value="true">With vocals</option>
                <option value="false">Instrumental</option>
              </select>
            </Field>
            <Failure error={mutation.error} />
            {mutation.isSuccess && (
              <p role="status" className="success">
                Preferences saved.
              </p>
            )}
            <button className="primary" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save preferences"}
            </button>
          </form>
        )
      )}
    </>
  );
}

export function UpcomingPage({
  feature,
}: {
  feature: "Discovery" | "Audio analysis";
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ON THE HORIZON</p>
          <h1>{feature}</h1>
        </div>
        <span className="pill">Coming later</span>
      </div>
      <Empty
        title={
          feature === "Discovery"
            ? "More ways to find your sound"
            : "A closer look at your sound"
        }
      >
        {feature === "Discovery"
          ? "External music discovery is not connected yet. You can build sets from your personal library today."
          : "Waveforms, beat grids and audio analysis need the upcoming audio pipeline. You can record BPM, key and energy in your library today."}
      </Empty>
      <Link className="button" to="/library">
        Explore your library
      </Link>
    </>
  );
}
