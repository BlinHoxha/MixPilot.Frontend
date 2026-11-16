import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiError, jobErrorMessage } from "@mixpilot/api-client";
import type { SetGenerationJob, SetRequirements } from "@mixpilot/api-client";
import { useSession } from "../../core/session";

const terminal = (status?: string) => status === "succeeded" || status === "failed" || status === "cancelled";

export function useGenerationJob() {
  const { api, identity } = useSession();
  const cache = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const previousPath = useRef(location.pathname);
  const [id, setId] = useState<string>();
  const [startedAt, setStartedAt] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      previousPath.current = location.pathname;
      setId(undefined);
    }
  }, [location.pathname]);
  const submission = useMutation({
    mutationFn: ({ name, requirements }: { name: string; requirements: SetRequirements }) =>
      api.createSetGenerationJob({ name, requirements }, crypto.randomUUID()),
    onSuccess: (created) => {
      if (!created.id) { setNotice("The API returned a job without an ID."); return; }
      setId(created.id);
      setStartedAt(Date.now());
      setTimedOut(false);
      setNotice("");
    },
  });
  const query = useQuery({
    queryKey: [identity, "job", id],
    queryFn: ({ signal }) => api.job(id!, signal),
    enabled: !!id && !timedOut,
    refetchInterval: (state) => state.state.data && terminal(state.state.data.status) ? false : 2000,
  });
  useEffect(() => {
    if (!id || !startedAt || timedOut || terminal(query.data?.status)) return;
    const remaining = Math.max(0, 300_000 - (Date.now() - startedAt));
    const timer = window.setTimeout(() => setTimedOut(true), remaining);
    return () => window.clearTimeout(timer);
  }, [id, startedAt, timedOut, query.data?.status]);
  useEffect(() => {
    if (terminal(query.data?.status))
      void cache.invalidateQueries({ queryKey: [identity, "jobs"] });
  }, [query.data?.status, cache, identity]);
  useEffect(() => {
    if (query.data?.status !== "succeeded" || !query.data.resultSetId) return;
    void cache.invalidateQueries({ queryKey: [identity, "sets"] });
    navigate(`/builder/${query.data.resultSetId}`);
    setId(undefined);
    submission.reset();
  }, [query.data?.status, query.data?.resultSetId, cache, identity, navigate]);
  const cancellation = useMutation({
    mutationFn: () => api.cancelJob(id!),
    onSuccess: (updated) => cache.setQueryData([identity, "job", id], updated),
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409 && error.code === "job_not_cancellable") {
        setNotice("The job has already reached its final state.");
        void query.refetch();
      }
    },
  });
  const job: SetGenerationJob | undefined = query.data ?? submission.data;
  return {
    job,
    isActive: submission.isPending || (!!id && !timedOut && !terminal(job?.status)),
    submit: submission.mutate,
    cancel: cancellation.mutate,
    canCancel: !!id && (job?.status === "queued" || job?.status === "running"),
    timedOut,
    notice,
    error: submission.error || query.error || cancellation.error,
    failureMessage: job?.status === "failed" ? jobErrorMessage(job.errorCode) : "",
  };
}
