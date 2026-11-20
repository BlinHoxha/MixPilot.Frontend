import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError } from "@mixpilot/api-client";
import { useSession } from "../../core/session";
import { Empty, Failure, Field, Loading } from "../../components/ui";

export function PlaylistDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, identity } = useSession();
  const cache = useQueryClient();
  const collectionKey = [identity, "collection", id];
  const collection = useQuery({
    queryKey: collectionKey,
    queryFn: ({ signal }) => api.collection(id!, signal),
    enabled: !!id,
  });
  const invalidate = async () => {
    await Promise.all([
      cache.invalidateQueries({ queryKey: [identity, "collections"] }),
      cache.invalidateQueries({ queryKey: collectionKey }),
      cache.invalidateQueries({ queryKey: [identity, "track"] }),
      cache.invalidateQueries({ queryKey: [identity, "tracks"] }),
    ]);
  };
  const refreshOnConflict = (error: unknown) => {
    if (error instanceof ApiError && error.code === "revision_conflict")
      void collection.refetch();
  };
  const update = useMutation({
    mutationFn: (next: { name: string; trackIds: string[] }) => api.updateCollection(id!, {
      ...next,
      expectedRevision: collection.data!.revision!,
    }),
    onSuccess: async (data) => {
      cache.setQueryData(collectionKey, data);
      await invalidate();
    },
    onError: refreshOnConflict,
  });
  const remove = useMutation({
    mutationFn: () => api.deleteCollection(id!, collection.data!.revision!),
    onSuccess: async () => {
      await invalidate();
      navigate("/playlists");
    },
    onError: refreshOnConflict,
  });
  const playlist = collection.data;
  const ids = playlist?.trackIds ?? [];
  const busy = update.isPending || remove.isPending;
  const reorder = (index: number, target: number) => {
    if (!playlist || busy || target < 0 || target >= ids.length) return;
    const ordered = [...ids];
    [ordered[index], ordered[target]] = [ordered[target]!, ordered[index]!];
    update.mutate({ name: playlist.name ?? "", trackIds: ordered });
  };
  return <>
    <div className="page-heading">
      <div>
        <p className="eyebrow">COLLECT YOUR INSPIRATION</p>
        <h1>{playlist?.name ?? "Playlist"}</h1>
        <p>Arrange the tracks in this playlist.</p>
      </div>
      <Link className="button" to="/playlists">Back to playlists</Link>
    </div>
    <Failure error={collection.error} retry={() => void collection.refetch()} />
    {collection.isPending ? <Loading /> : playlist && <>
      <form className="settings-card" key={playlist.revision} onSubmit={(event) => {
        event.preventDefault();
        const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
        if (name.length < 1 || name.length > 150) return;
        update.mutate({ name, trackIds: ids });
      }}>
        <Field label="Playlist name">
          <input name="name" defaultValue={playlist.name ?? ""} required minLength={1} maxLength={150} />
        </Field>
        <button className="primary" disabled={busy}>{update.isPending ? "Saving…" : "Rename playlist"}</button>
      </form>
      <Failure error={update.error} retry={update.error instanceof ApiError && update.error.code === "revision_conflict"
        ? () => void collection.refetch() : undefined} />
      {ids.length ? <ol className="playlist-tracks playlist-detail-tracks">
        {ids.map((trackId, index) => <PlaylistRow key={trackId} id={trackId} index={index}
          count={ids.length} disabled={busy} move={reorder}
          remove={() => update.mutate({ name: playlist.name ?? "", trackIds: ids.filter((value) => value !== trackId) })} />)}
      </ol> : <Empty title="This playlist is empty">Choose tracks from your library to create another playlist.</Empty>}
      <div className="actions">
        <button className="danger" disabled={busy} onClick={() => {
          if (window.confirm(`Delete playlist “${playlist.name}”?`)) remove.mutate();
        }}>Delete playlist</button>
      </div>
      <Failure error={remove.error} retry={remove.error instanceof ApiError && remove.error.code === "revision_conflict"
        ? () => void collection.refetch() : undefined} />
    </>}
  </>;
}

function PlaylistRow({ id, index, count, disabled, move, remove }: {
  id: string; index: number; count: number; disabled: boolean;
  move: (index: number, target: number) => void; remove: () => void;
}) {
  const { api, identity } = useSession();
  const track = useQuery({
    queryKey: [identity, "track", id],
    queryFn: ({ signal }) => api.track(id, signal),
    retry: false,
  });
  const title = track.data?.title || "Unavailable track";
  return <li className="playlist-detail-row">
    <span><strong>{title}</strong>{track.data?.artist && <> — {track.data.artist}</>}</span>
    <div className="row-actions">
      <button type="button" aria-label={`Move ${title} up`} disabled={disabled || index === 0}
        onClick={() => move(index, index - 1)}>Up</button>
      <button type="button" aria-label={`Move ${title} down`} disabled={disabled || index === count - 1}
        onClick={() => move(index, index + 1)}>Down</button>
      <button type="button" aria-label={`Remove ${title} from playlist`} disabled={disabled}
        onClick={remove}>Remove</button>
    </div>
  </li>;
}
