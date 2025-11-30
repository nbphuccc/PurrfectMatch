import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  getPlaydateCommentsFirebase,
  addPlaydateCommentFirebase,
} from "../api/playdates";
import { getCurrentUser, getUserProfileFirebase } from "../api/firebaseAuth";
import MapView, { Marker } from "react-native-maps";

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function PlaydatePost() {
  const params = useLocalSearchParams();

  const getParamString = (value: string | string[] | undefined): string | undefined =>
    Array.isArray(value) ? value[0] : typeof value === "string" ? value : undefined;

  const postId = getParamString(params.id) || "";
  const authorId = getParamString(params.authorId) || "";
  const title = getParamString(params.title) || "Playdate";
  const location = getParamString(params.location) || "Location: TBD";
  const date = getParamString(params.date) || "Date: TBD";
  const address = getParamString(params.address);
  const city = getParamString(params.city);
  const state = getParamString(params.state);
  const zip = getParamString(params.zip);
  const username = getParamString(params.user) || "User";
  const time = getParamString(params.time) || "Just now";
  const description =
    getParamString(params.description) ||
    "No description provided for this playdate.";

  const rawImage = getParamString(params.image);
  const image = rawImage || undefined;

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [postAvatarUrl, setPostAvatarUrl] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const authorProfile = await getUserProfileFirebase(authorId);
        setPostAvatarUrl(authorProfile?.avatar || null);
        const currentUser = getCurrentUser();
        if (!currentUser) {
          return;
        }
        const profile = await getUserProfileFirebase(currentUser.uid);
        setAvatarUrl(profile?.avatar || null);
      } catch (err) {
        console.error("Failed to fetch avatar:", err);
        setPostAvatarUrl(null);
      }
    };

    if (authorId) {
      fetchAvatar();
    }
  });

  const openInMaps = async () => {
    if (!coords) return;
    const { latitude, longitude } = coords;
    const label = address?.trim() || location || title || "Playdate location";
    const encodedLabel = encodeURIComponent(label);
    const latLng = `${latitude},${longitude}`;

    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?ll=${latLng}&q=${encodedLabel}`
        : Platform.OS === "android"
        ? `geo:${latLng}?q=${latLng}(${encodedLabel})`
        : `https://www.google.com/maps/search/?api=1&query=${latLng}`;

    try {
      (await Linking.canOpenURL(url)) ? Linking.openURL(url) : Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latLng}`);
    } catch (e) {
      console.error("Failed to open maps:", e);
    }
  };

  const loadComments = async () => {
    if (!postId) return;
    setLoadingComments(true);
    const data = await getPlaydateCommentsFirebase(postId);
    const commentsWithAvatars = await Promise.all(
      data.map(async (comment) => {
        const profile = await getUserProfileFirebase(comment.authorId);
        return {
          ...comment,
          avatar: profile?.avatar || "",
        };
      })
    );
    setComments(commentsWithAvatars);
    setLoadingComments(false);
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handlePostComment = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !comment.trim()) return;

    await addPlaydateCommentFirebase({
      postId,
      authorId: currentUser.uid,
      username: currentUser.displayName || "User",
      content: comment.trim(),
    });

    setComment("");
    loadComments();
  };

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!address || !city || !state) return;

      const fullAddress = `${address}, ${city}, ${state} ${zip ?? ""}`;
      setLoadingMap(true);
      setMapError(null);

      try {
        const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
        const url =
          "https://maps.googleapis.com/maps/api/geocode/json?address=" +
          encodeURIComponent(fullAddress) +
          `&key=${apiKey}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== "OK" || !data.results?.length) {
          setMapError("Could not find this location.");
          return;
        }

        const loc = data.results[0].geometry.location;
        setCoords({ latitude: loc.lat, longitude: loc.lng });
      } catch {
        setMapError("Failed to load map.");
      } finally {
        setLoadingMap(false);
      }
    };

    fetchCoordinates();
  }, [address, city, state, zip]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TouchableOpacity onPress={() => router.push({ pathname: "/userProfile", params: { authorId: authorId } })}>
              <Image
                source={{ uri: postAvatarUrl || 'https://media.istockphoto.com/id/1444657782/vector/dog-and-cat-profile-logo-design.jpg?s=612x612&w=0&k=20&c=86ln0k0egBt3EIaf2jnubn96BtMu6sXJEp4AvaP0FJ0=' }}
                style={styles.profilePic}
              />
            </TouchableOpacity>
            <View>
              <TouchableOpacity onPress={() => router.push({ pathname: "/userProfile", params: { authorId: authorId } })}>
                <Text style={styles.username}>{username}</Text>
              </TouchableOpacity>
              <Text style={styles.time}>{time}</Text>
            </View>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{location}</Text>
          <Text style={styles.subtitle}>{date}</Text>

          {image && <Image source={{ uri: image }} style={styles.image} />}

          <View style={{ marginTop: 12 }}>
            {loadingMap && <Text style={{ color: "#666" }}>Loading map...</Text>}
            {mapError && <Text style={{ color: "#999" }}>{mapError}</Text>}
            {coords && (
              <TouchableOpacity activeOpacity={0.9} onPress={openInMaps} style={styles.mapTouchable}>
                <MapView
                  style={styles.map}
                  pointerEvents="none"
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                  initialRegion={{
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker coordinate={coords} />
                </MapView>

                <View style={styles.mapBadge}>
                  <Ionicons name="navigate-outline" size={14} color="#fff" />
                  <Text style={styles.mapBadgeText}>Open in Maps</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.description}>{description}</Text>
        </View>

        {/* ⭐ COMMUNITY-STYLE COMMENT BAR (FINAL VERSION) ⭐ */}
        <View style={styles.commentRow}>
          <Image
            source={{ uri: avatarUrl || 'https://media.istockphoto.com/id/1444657782/vector/dog-and-cat-profile-logo-design.jpg?s=612x612&w=0&k=20&c=86ln0k0egBt3EIaf2jnubn96BtMu6sXJEp4AvaP0FJ0=' }}
            style={styles.commentProfile}
          />

          <View style={styles.commentBubble}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              value={comment}
              onChangeText={setComment}
            />
          </View>

          <TouchableOpacity style={styles.postButton} onPress={handlePostComment}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>Post</Text>
          </TouchableOpacity>
        </View>

        {/* COMMENTS LIST */}
        <View style={{ marginTop: 20 }}>
          {loadingComments ? (
            <Text style={{ color: "#666" }}>Loading comments...</Text>
          ) : comments.length === 0 ? (
            <Text style={{ color: "#666" }}>No comments yet — be the first!</Text>
          ) : (
            comments.map((c) => (
              <View key={c.id} style={styles.commentItem}>
                <TouchableOpacity onPress={() => router.push({ pathname: "/userProfile", params: { authorId: c.authorId } })}>
                  <Image
                    source={{ uri: c.avatar || 'https://media.istockphoto.com/id/1444657782/vector/dog-and-cat-profile-logo-design.jpg?s=612x612&w=0&k=20&c=86ln0k0egBt3EIaf2jnubn96BtMu6sXJEp4AvaP0FJ0=' }}
                    style={styles.commentProfile}
                  />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <TouchableOpacity onPress={() => router.push({ pathname: "/userProfile", params: { authorId: c.authorId } })}>
                      <Text style={styles.commentUsername}>{c.username}</Text>
                    </TouchableOpacity>
                    <Text style={styles.commentTime}>{timeAgo(c.createdAt)}</Text>
                  </View>
                  <Text style={styles.commentContent}>{c.content}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },

  profilePic: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },

  username: { fontWeight: "600", fontSize: 15 },
  time: { color: "#666", fontSize: 12 },

  title: { fontSize: 20, fontWeight: "bold", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 4 },

  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginVertical: 12,
    resizeMode: "cover",
  },

  description: {
    fontSize: 15,
    color: "#333",
    marginBottom: 14,
    lineHeight: 20,
  },

  /* ⭐ FINAL COMMUNITY COMMENT BAR ⭐ */
  commentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },

  commentBubble: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  commentProfile: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ddd",
  },

  commentInput: {
    fontSize: 15,
  },

  postButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  commentItem: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  commentUsername: { fontWeight: "600", fontSize: 14 },
  commentTime: { color: "#888", fontSize: 12 },
  commentContent: { fontSize: 14, marginTop: 2, color: "#333" },

  map: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
  },
  mapTouchable: { marginTop: 10, borderRadius: 12, overflow: "hidden" },

  mapBadge: {
    position: "absolute",
    right: 10,
    bottom: 15,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  mapBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
});
