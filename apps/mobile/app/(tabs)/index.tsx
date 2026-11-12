import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { api, nativeIdentity } from "../../src/session";
import { NativeError, styles } from "../../src/ui";
import { tokens } from "@mixpilot/shared";
export default function LibraryScreen() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const query = useQuery({
    queryKey: [nativeIdentity, "tracks", page, filter],
    queryFn: ({ signal }) =>
      api.tracks({ pageNumber: page, pageSize: 20, search: filter }, signal),
  });
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Your sound, with you.</Text>
      <Text style={styles.muted}>Your personal library on the move.</Text>
      <TextInput
        accessibilityLabel="Search library"
        style={styles.input}
        placeholder="Search tracks or artists"
        placeholderTextColor={tokens.muted}
        value={search}
        onChangeText={setSearch}
        maxLength={200}
      />
      {query.isPending && <ActivityIndicator color={tokens.accent} />}
      {query.error ? (
        <NativeError error={query.error} retry={() => void query.refetch()} />
      ) : (
        <FlatList
          data={query.data?.items ?? []}
          keyExtractor={(t) => t.id!}
          refreshing={query.isRefetching}
          onRefresh={() => void query.refetch()}
          ListEmptyComponent={
            !query.isPending ? (
              <Text style={styles.muted}>
                No matching tracks. Add tracks using the web workspace.
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.title}`}
              onPress={() =>
                router.push({
                  pathname: "/track/[id]",
                  params: { id: item.id! },
                })
              }
            >
              <Text style={styles.text}>{item.title}</Text>
              <Text style={styles.muted}>{item.artist}</Text>
              <Text style={styles.badge}>
                {item.bpm ?? "—"} BPM · {item.musicalKey ?? "Unknown key"}
              </Text>
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
        <Text style={styles.muted}>Page {page}</Text>
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
