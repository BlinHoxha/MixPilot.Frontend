import { useEffect, useRef, useState } from "react";
import { ApiError, intentErrorMessage } from "@mixpilot/api-client";
import type { SetIntentResponse } from "@mixpilot/api-client";
import { useSession } from "../../core/session";
import { Field } from "../../components/ui";

export function PromptPreview({ territory, onPreview }: {
  territory: string;
  onPreview: (result: SetIntentResponse) => void;
}) {
  const { api } = useSession();
  const [prompt, setPrompt] = useState("");
  const [region, setRegion] = useState(territory);
  const [result, setResult] = useState<SetIntentResponse>();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => setRegion(territory), [territory]);

  async function preview() {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setError("");
    try {
      const next = await api.interpretSetIntent({ prompt: prompt.trim(), territory: region }, controller.signal);
      if (!controller.signal.aborted) {
        setResult(next);
        onPreview(next);
      }
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(cause instanceof ApiError ? intentErrorMessage(cause.code) : intentErrorMessage());
    } finally {
      if (!controller.signal.aborted) setPending(false);
    }
  }

  return (
    <section className="explanation" aria-label="Prompt preview">
      <h2>Preview a prompt</h2>
      <form onSubmit={(event) => { event.preventDefault(); void preview(); }}>
        <Field label="Describe your set">
          <textarea minLength={1} maxLength={1000} required value={prompt}
            onChange={(event) => setPrompt(event.target.value)} />
        </Field>
        <Field label="Prompt territory">
          <input pattern="[A-Z]{2}" maxLength={2} required value={region}
            onChange={(event) => setRegion(event.target.value.toUpperCase())} />
        </Field>
        <button type="submit" disabled={pending}>{pending ? "Previewing…" : "Preview prompt"}</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      {result && (
        <div role="status">
          <p>Preview filled the requirements below. Review and edit them before generating.</p>
          {result.assumptions?.length ? <><h3>Assumptions</h3><ul>{result.assumptions.map((item) => <li key={item}>{item}</li>)}</ul></> : null}
          {result.unresolved?.length ? <><h3>Unresolved terms</h3><ul>{result.unresolved.map((item) => <li key={item}>{item}</li>)}</ul></> : null}
        </div>
      )}
    </section>
  );
}
