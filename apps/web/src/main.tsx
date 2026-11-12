import { createRoot } from "react-dom/client";
import { App, ErrorBoundary } from "./app/App";
import { SessionProvider } from "./core/session";
import "./styles.css";
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <SessionProvider>
      <App />
    </SessionProvider>
  </ErrorBoundary>,
);
