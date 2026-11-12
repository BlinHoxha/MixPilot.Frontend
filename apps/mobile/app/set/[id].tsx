import { FlatList, Text, ActivityIndicator, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { duration, tokens } from "@mixpilot/shared";
import { api, nativeIdentity } from "../../src/session";
import { NativeError, styles } from "../../src/ui";
export default function SetDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({
    queryKey: [nativeIdentity, "set", id],
    queryFn: ({ signal }) => api.set(id, signal),
  });
  if (query.isPending) return <ActivityIndicator color={tokens.accent} />;
  if (query.error)
    return (
      <NativeError error={query.error} retry={() => void query.refetch()} />
    );
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{query.data?.name}</Text>
      <Text style={styles.muted}>
        Version {query.data?.version} · {duration(query.data?.durationSeconds)}
      </Text>
      {query.data?.warnings?.map((w) => (
        <Text key={w} style={styles.muted}>
          {w}
        </Text>
      ))}
      <FlatList
        style={{ marginTop: 20 }}
        data={query.data?.tracks ?? []}
        keyExtractor={(t) => t.trackId!}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>
              {item.position}. {item.title}
            </Text>
            <Text style={styles.muted}>{item.artist}</Text>
            <Text style={styles.badge}>
              {item.bpm ?? "—"} BPM · {item.musicalKey ?? "Unknown key"}
              {item.isLocked ? " · Locked" : ""}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
