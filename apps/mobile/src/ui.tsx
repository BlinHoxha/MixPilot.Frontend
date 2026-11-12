import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "@mixpilot/shared";
import { errorMessage } from "@mixpilot/api-client";
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.background, padding: 20 },
  title: {
    color: tokens.text,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
  },
  text: { color: tokens.text, fontSize: 15 },
  muted: { color: tokens.muted, lineHeight: 23 },
  input: {
    color: tokens.text,
    backgroundColor: tokens.surface,
    borderColor: tokens.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginVertical: 16,
  },
  card: {
    backgroundColor: tokens.surface,
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderColor: tokens.border,
    borderWidth: 1,
  },
  button: {
    backgroundColor: "#6338b4",
    padding: 15,
    borderRadius: 9,
    marginVertical: 10,
    alignItems: "center",
  },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  badge: { color: "#d6bdff", marginTop: 10 },
});
export function NativeError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <View style={styles.card}>
      <Text accessibilityRole="alert" style={styles.muted}>
        {errorMessage(error)}
      </Text>
      <Pressable
        accessibilityRole="button"
        style={styles.button}
        onPress={retry}
      >
        <Text style={styles.text}>Retry</Text>
      </Pressable>
    </View>
  );
}
