import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MobileSession } from "../src/session";
import { tokens } from "@mixpilot/shared";
export default function RootLayout() {
  return (
    <MobileSession>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: tokens.background },
          headerTintColor: tokens.text,
          contentStyle: { backgroundColor: tokens.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="track/[id]" options={{ title: "Track details" }} />
        <Stack.Screen name="set/[id]" options={{ title: "Saved set" }} />
      </Stack>
    </MobileSession>
  );
}
