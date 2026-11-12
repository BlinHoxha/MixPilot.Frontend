import { Tabs } from "expo-router";
import { tokens } from "@mixpilot/shared";
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: tokens.background },
        headerTintColor: tokens.text,
        tabBarStyle: { backgroundColor: tokens.surface },
        tabBarActiveTintColor: tokens.accent,
        tabBarInactiveTintColor: tokens.muted,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Library" }} />
      <Tabs.Screen name="sets" options={{ title: "Saved sets" }} />
    </Tabs>
  );
}
