import { useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { api, nativeIdentity } from "../../src/session";
import { NativeError, styles } from "../../src/ui";
import { tokens } from "@mixpilot/shared";
export default function SetsScreen() {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: [nativeIdentity, "sets", page],
    queryFn: ({ signal }) => api.sets(page, signal),
  });
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Keep the flow.</Text>
      <Text style={styles.muted}>
        Review sets created in your web workspace.
      </Text>
      {query.isPending && <ActivityIndicator color={tokens.accent} />}
      {query.error ? (
        <NativeError error={query.error} retry={() => void query.refetch()} />
      ) : (
        <FlatList
          style={{ marginTop: 20 }}
          data={query.data?.items ?? []}
          keyExtractor={(s) => s.id!}
          refreshing={query.isRefetching}
          onRefresh={() => void query.refetch()}
          ListEmptyComponent={
            !query.isPending ? (
              <Text style={styles.muted}>No saved sets yet.</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: "/set/[id]", params: { id: item.id! } })
              }
            >
              <Text style={styles.text}>{item.name}</Text>
              <Text style={styles.badge}>Revision {item.revision}</Text>
            </Pressable>
          )}
        />
      )}
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          style={styles.button}
          disabled={page <= 1}
          onPress={() => setPage(page - 1)}
        >
          <Text style={styles.text}>Previous</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={styles.button}
          disabled={page >= (query.data?.totalPages ?? 1)}
          onPress={() => setPage(page + 1)}
        >
          <Text style={styles.text}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}
