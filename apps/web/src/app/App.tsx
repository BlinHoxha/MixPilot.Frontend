import { Component } from "react";
import type { ReactNode } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  NavLink,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import {
  AudioLines,
  Compass,
  Home,
  Library,
  ListMusic,
  Settings,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useSession } from "../core/session";
import { LibraryPage } from "../features/library/LibraryPage";
import { SetBuilderPage } from "../features/sets/SetBuilderPage";
import { PlaylistDetailPage } from "../features/workspace/PlaylistDetailPage";
import {
  DashboardPage,
  PlaylistsPage,
  SavedSetsPage,
  SettingsPage,
  UpcomingPage,
} from "../features/workspace/WorkspacePages";
const navigation = [
  { to: "/", label: "Home", icon: Home },
  { to: "/builder", label: "AI Set Builder", icon: WandSparkles },
  { to: "/library", label: "My Library", icon: Library },
  { to: "/playlists", label: "Playlists", icon: ListMusic },
  { to: "/sets", label: "Saved sets", icon: Sparkles },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/analysis", label: "Analysis", icon: AudioLines },
];
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="auth-screen">
        <h1>Something went wrong.</h1>
        <p>Reload the workspace to try again.</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </main>
    ) : (
      this.props.children
    );
  }
}
function Shell() {
  const { name, identity, signOut } = useSession();
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="app-shell">
        <aside className="sidebar">
          <NavLink className="brand" to="/">
            <AudioLines size={31} />
            <span>
              MixPilot<small>FIND YOUR FLOW</small>
            </span>
          </NavLink>
          <span className="nav-label">WORKSPACE</span>
          <nav aria-label="Main navigation">
            {navigation.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"}>
                <item.icon size={19} />
                {item.label}
                {["/discover", "/analysis"].includes(item.to) && (
                  <small>SOON</small>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <NavLink to="/settings">
              <Settings size={18} /> Preferences
            </NavLink>
            <div className="identity">
              <div className="avatar">{name.slice(0, 1)}</div>
              <div>
                <strong>{name}</strong>
                <small>
                  {identity === "local-development"
                    ? "Development identity"
                    : "Personal workspace"}
                </small>
              </div>
            </div>
            {identity !== "local-development" && (
              <button onClick={signOut}>Sign out</button>
            )}
          </div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <span>
              <span className="status-dot" /> Your creative space
            </span>
            <span className="muted">DISCOVER. CURATE. CREATE.</span>
          </header>
          <main id="main" tabIndex={-1}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/builder" element={<SetBuilderPage />} />
              <Route path="/builder/:id" element={<SetBuilderPage />} />
              <Route path="/sets" element={<SavedSetsPage />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route
                path="/discover"
                element={<UpcomingPage feature="Discovery" />}
              />
              <Route
                path="/analysis"
                element={<UpcomingPage feature="Audio analysis" />}
              />
              <Route
                path="/auth/callback"
                element={<Navigate to="/library" replace />}
              />
              <Route
                path="*"
                element={
                  <div className="empty">
                    <h1>Page not found</h1>
                    <NavLink to="/">Return home</NavLink>
                  </div>
                }
              />
            </Routes>
          </main>
          <footer>
            MixPilot <span>Made for the way you move music.</span>
          </footer>
        </div>
      </div>
    </>
  );
}

const router = createBrowserRouter([{ path: "*", element: <Shell /> }]);
export function App() {
  return <RouterProvider router={router} />;
}
