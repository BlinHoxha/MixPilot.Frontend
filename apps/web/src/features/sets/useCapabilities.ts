import { useQuery } from "@tanstack/react-query";
import { useSession } from "../../core/session";

export function useCapabilities() {
  const { api, identity } = useSession();
  return useQuery({
    queryKey: [identity, "capabilities"],
    queryFn: ({ signal }) => api.capabilities(signal),
  });
}
