import { ScrollView, Text, ActivityIndicator, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { duration, tokens } from "@mixpilot/shared";
import { api, nativeIdentity } from "../../src/session";
import { NativeError, styles } from "../../src/ui";
export default function TrackDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({
    queryKey: [nativeIdentity, "track", id],
    queryFn: ({ signal }) => api.track(id, signal),
  });
  if (query.isPending) return <ActivityIndicator color={tokens.accent} />;
  if (query.error)
    return (
      <NativeError error={query.error} retry={() => void query.refetch()} />
    );
  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>{query.data?.title}</Text>
      <Text style={styles.muted}>{query.data?.artist}</Text>
      <View style={[styles.card, { marginTop: 25 }]}>
        <Text style={styles.badge}>
          {query.data?.bpm ?? "—"} BPM ·{" "}
          {query.data?.musicalKey ?? "Unknown key"} · Energy{" "}
          {query.data?.energy ?? "—"}
        </Text>
        <Text style={styles.muted}>
          {duration(query.data?.durationSeconds)} ·{" "}
          {query.data?.genre || "No genre"}
        </Text>
      </View>
      <Text style={styles.muted}>
        Metadata only. Audio playback is not available yet.
      </Text>
    </ScrollView>
  );
}
