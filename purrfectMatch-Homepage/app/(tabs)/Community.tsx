import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function CommunityTab() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* ... your list of community posts ... */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/CreateCommunityPost")}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>+ Post</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fab: {
    position: "absolute", right: 16, bottom: 20,
    backgroundColor: "#007AFF", borderRadius: 24,
    paddingHorizontal: 18, paddingVertical: 12,
  },
});