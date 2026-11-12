import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  UserManager,
  WebStorageStateStore,
  InMemoryWebStorage,
} from "oidc-client-ts";
import type { User } from "oidc-client-ts";
import { createMixPilotApi } from "@mixpilot/api-client";
import type { MixPilotApi } from "@mixpilot/api-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { shouldRetry } from "@mixpilot/api-client";

const development =
  import.meta.env.DEV && import.meta.env.VITE_DEV_IDENTITY === "true";
const authority = import.meta.env.VITE_OIDC_AUTHORITY;
const clientId = import.meta.env.VITE_OIDC_CLIENT_ID;
const manager =
  authority && clientId
    ? new UserManager({
        authority,
        client_id: clientId,
        redirect_uri: `${window.location.origin}/auth/callback`,
        post_logout_redirect_uri: window.location.origin,
        response_type: "code",
        scope: import.meta.env.VITE_OIDC_SCOPE || "openid profile",
        ...(import.meta.env.VITE_OIDC_RESOURCE
          ? { resource: import.meta.env.VITE_OIDC_RESOURCE }
          : {}),
        // Tokens remain in memory; only PKCE transaction state survives the redirect.
        userStore: new WebStorageStateStore({
          store: new InMemoryWebStorage(),
        }),
        stateStore: new WebStorageStateStore({ store: window.sessionStorage }),
        automaticSilentRenew: true,
      })
    : undefined;

type Session = {
  identity: string;
  name: string;
  api: MixPilotApi;
  signOut: () => void;
};
const Context = createContext<Session | null>(null);
export function useSession() {
  const value = useContext(Context);
  if (!value) throw Error("Session unavailable");
  return value;
}

function SignedIn({
  identity,
  name,
  children,
  signOut,
}: {
  identity: string;
  name: string;
  children: ReactNode;
  signOut: () => void;
}) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 15000, retry: shouldRetry },
          mutations: { retry: false },
        },
      }),
    [],
  );
  const api = useMemo(
    () =>
      createMixPilotApi({
        baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5290",
        getAccessToken: async () => {
          const user = await manager?.getUser();
          return user && !user.expired ? user.access_token : undefined;
        },
        onUnauthorized: () => {
          if (!development) signOut();
        },
      }),
    [signOut],
  );
  useEffect(
    () => () => {
      void queryClient.cancelQueries();
      queryClient.clear();
    },
    [queryClient],
  );
  return (
    <Context.Provider value={{ identity, name, api, signOut }}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Context.Provider>
  );
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(development || !manager);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!manager || development) return;
    const load = (value: User) => setUser(value.expired ? null : value);
    const unload = () => setUser(null);
    manager.events.addUserLoaded(load);
    manager.events.addUserUnloaded(unload);
    manager.events.addAccessTokenExpired(unload);
    const callback = window.location.pathname === "/auth/callback";
    void (callback ? manager.signinRedirectCallback() : manager.getUser())
      .then((value) => {
        setUser(value && !value.expired ? value : null);
        if (callback) window.history.replaceState({}, "", "/library");
      })
      .catch(() =>
        setError("Sign-in could not be completed. Please try again."),
      )
      .finally(() => setReady(true));
    return () => {
      manager.events.removeUserLoaded(load);
      manager.events.removeUserUnloaded(unload);
      manager.events.removeAccessTokenExpired(unload);
    };
  }, []);
  if (!ready)
    return (
      <main className="auth-screen">
        <p role="status">Connecting your account…</p>
      </main>
    );
  if (!development && !user)
    return (
      <main className="auth-screen">
        <div className="auth-card">
          <div className="brand-mark">M</div>
          <p className="eyebrow">YOUR NEXT SET STARTS HERE</p>
          <h1>Find your flow.</h1>
          <p>Your library. Your sound. One workspace.</p>
          {error && <p role="alert">{error}</p>}
          {manager ? (
            <button
              className="primary"
              onClick={() =>
                void manager
                  .signinRedirect()
                  .catch(() => setError("Unable to start sign-in."))
              }
            >
              Sign in to MixPilot
            </button>
          ) : (
            <p>
              Sign-in is not configured. For local development, copy{" "}
              <code>apps/web/.env.example</code> to <code>.env.local</code> and
              restart the web app.
            </p>
          )}
        </div>
      </main>
    );
  const identity = development
    ? "local-development"
    : `${user!.profile.iss}:${user!.profile.sub}`;
  const signOut = () => {
    setUser(null);
    void manager?.removeUser();
  };
  return (
    <SignedIn
      key={identity}
      identity={identity}
      name={development ? "Local workspace" : user?.profile.name || "DJ"}
      signOut={signOut}
    >
      {children}
    </SignedIn>
  );
}
