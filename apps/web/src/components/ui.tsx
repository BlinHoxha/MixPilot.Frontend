import { useEffect, useRef, useId } from "react";
import type { ReactNode } from "react";
import { X, Music2 } from "lucide-react";
import { ApiError, errorMessage } from "@mixpilot/api-client";
export function Failure({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  if (!error) return null;
  return (
    <div role="alert" className="error">
      <strong>{errorMessage(error)}</strong>
      {error instanceof ApiError && error.fields && (
        <ul>
          {Object.entries(error.fields).flatMap(([field, messages]) =>
            messages.map((message) => (
              <li key={field + message}>
                {field}: {message}
              </li>
            )),
          )}
        </ul>
      )}
      {retry && <button onClick={retry}>Retry</button>}
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      <Music2 size={32} />
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
export function Loading() {
  return (
    <p role="status" className="loading">
      Loading your workspace…
    </p>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      aria-labelledby={titleId}
    >
      <header>
        <h2 id={titleId}>{title}</h2>
        <button aria-label="Close dialog" onClick={close}>
          <X size={18} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function Artwork({
  title,
  large = false,
}: {
  title?: string;
  large?: boolean;
}) {
  return (
    <div className={`artwork ${large ? "large" : ""}`} aria-hidden="true">
      <Music2 size={large ? 58 : 18} />
      <span>{title?.slice(0, 1)}</span>
    </div>
  );
}
export function Pagination({
  page,
  pages,
  change,
}: {
  page: number;
  pages: number;
  change: (value: number) => void;
}) {
  return (
    <nav aria-label="Pagination" className="pagination">
      <button disabled={page <= 1} onClick={() => change(page - 1)}>
        Previous
      </button>
      <span>
        Page {page} of {Math.max(1, pages)}
      </span>
      <button disabled={page >= pages} onClick={() => change(page + 1)}>
        Next
      </button>
    </nav>
  );
}
