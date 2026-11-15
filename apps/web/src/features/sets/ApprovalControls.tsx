import { useMutation } from "@tanstack/react-query";
import { ApiError, errorMessage } from "@mixpilot/api-client";
import type { DjSet, SetVersion } from "@mixpilot/api-client";
import { useSession } from "../../core/session";

export function ApprovalControls({ set, version, disabled, onApproved, reload }: {
  set: DjSet;
  version?: SetVersion;
  disabled: boolean;
  onApproved: (value: DjSet) => Promise<void>;
  reload: () => void;
}) {
  const { api } = useSession();
  const number = version?.version ?? set.version;
  const status = version?.status ?? set.status ?? "draft";
  const approve = useMutation({
    mutationFn: () => api.approveSetVersion(set.id!, number!, set.revision!),
    onSuccess: onApproved,
  });
  const error = approve.error;
  return <div className="toolbar compact">
    <span className="pill">{status}</span>
    {version?.approvedAt && <small>Approved {new Date(version.approvedAt).toLocaleString()}</small>}
    <button disabled={disabled || approve.isPending || status === "approved" || number == null}
      onClick={() => approve.mutate()}>
      {approve.isPending ? "Approving…" : "Approve this version"}
    </button>
    {error && <p className="error" role="alert">
      {error instanceof ApiError && error.code === "track_ineligible"
        ? error.message
        : errorMessage(error)}
      {error instanceof ApiError && error.status === 409 && <button onClick={reload}>Reload latest data</button>}
    </p>}
  </div>;
}
