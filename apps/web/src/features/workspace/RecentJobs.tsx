import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { jobErrorMessage } from "@mixpilot/api-client";
import { useSession } from "../../core/session";
import { Empty, Failure, Loading } from "../../components/ui";
import { useCapabilities } from "../sets/useCapabilities";

export function RecentJobs() {
  const { api, identity } = useSession();
  const capabilities = useCapabilities();
  const enabled = !!capabilities.data?.enabledFeatures?.includes("setGenerationJobs");
  const jobs = useQuery({
    queryKey: [identity, "jobs", 1, 10],
    queryFn: ({ signal }) => api.jobs({ pageNumber: 1, pageSize: 10 }, signal),
    enabled,
    refetchInterval: (query) => query.state.data?.items?.some((job) =>
      job.status === "queued" || job.status === "running") ? 2000 : false,
  });
  if (!enabled) return null;
  return <section aria-label="Recent jobs">
    <div className="section-heading"><h2>Recent jobs</h2></div>
    <Failure error={jobs.error} retry={() => void jobs.refetch()} />
    {jobs.isPending ? <Loading /> : jobs.data?.items?.length ? <ul className="playlist-tracks">
      {jobs.data.items.map((job) => <li key={job.id}>
        <strong>{job.status ?? "Unknown"}</strong> · {job.progress ?? 0}% · {job.createdAt ? new Date(job.createdAt).toLocaleString() : "Unknown time"}
        {job.status === "failed" && <span> · {jobErrorMessage(job.errorCode)}</span>}
        {job.status === "succeeded" && job.resultSetId && <Link to={`/builder/${job.resultSetId}`}>Open set</Link>}
      </li>)}
    </ul> : !jobs.error && <Empty title="No recent jobs">Generated sets will appear here.</Empty>}
  </section>;
}
