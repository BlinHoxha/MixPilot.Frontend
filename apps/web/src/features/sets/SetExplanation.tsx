import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { useSession } from "../../core/session";
import { Failure, Field } from "../../components/ui";
export function SetExplanation({
  id,
  disabled,
}: {
  id: string;
  disabled: boolean;
}) {
  const { api, identity } = useSession();
  const [question, setQuestion] = useState(
    "Explain the musical choices in this set.",
  );
  const capabilities = useQuery({
    queryKey: [identity, "capabilities"],
    queryFn: ({ signal }) => api.capabilities(signal),
  });
  const explain = useMutation({ mutationFn: () => api.explain(id, question) });
  if (!capabilities.data?.enabledFeatures?.includes("setExplanations"))
    return null;
  return (
    <section className="explanation">
      <h3>
        <Sparkles size={15} /> Set insights
      </h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          explain.mutate();
        }}
      >
        <Field label="Ask about this saved set">
          <textarea
            minLength={2}
            maxLength={2000}
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </Field>
        <button disabled={disabled || explain.isPending}>
          {explain.isPending ? "Preparing explanation…" : "Explain set"}
        </button>
      </form>
      {disabled && (
        <p className="caption">
          Save changes and return to the latest version to request insights.
        </p>
      )}
      <Failure error={explain.error} />
      {explain.data?.explanation && (
        <div aria-live="polite">
          <p className="explanation-text">{explain.data.explanation.answer}</p>
          <small>Provider: {explain.data.explanation.provider}</small>
          <p className="caption">
            Based on the saved set's metadata. This does not analyze the audio.
          </p>
        </div>
      )}
    </section>
  );
}
