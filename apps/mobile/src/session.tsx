import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMixPilotApi, shouldRetry } from "@mixpilot/api-client";
import { Text, View } from "react-native";
import type { ReactNode } from "react";
import { tokens } from "@mixpilot/shared";

const client = new QueryClient({
  defaultOptions: {
    queries: { retry: shouldRetry, staleTime: 15000 },
    mutations: { retry: false },
  },
});
export const nativeIdentity = "local-development";
export const api = createMixPilotApi({
  baseUrl: process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:5290",
});
export function MobileSession({ children }: { children: ReactNode }) {
  // A device-side opt-in never grants access by itself: the API must separately
  // enable its Development identity. Production remains closed until native OIDC.
  if (!__DEV__ || process.env.EXPO_PUBLIC_DEV_IDENTITY !== "true")
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: tokens.background,
          padding: 28,
        }}
      >
        <Text style={{ color: tokens.text, fontSize: 28, marginBottom: 16 }}>
          MixPilot
        </Text>
        <Text style={{ color: tokens.muted, lineHeight: 24 }}>
          Native account integration is the next mobile increment. This
          companion preview currently supports an explicitly enabled local
          development identity.
        </Text>
      </View>
    );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
