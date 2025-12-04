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
  Modal,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  PlaydatePostFirebase,
  getPlaydateCommentsFirebase,
  addPlaydateCommentFirebase,
  deletePlaydateCommentFirebase,
  editPlaydateCommentFirebase,
  getPlaydatePostFirebase,
} from "../api/playdates";
import { MapLocation } from "./(tabs)/PlayDate";
import { getCurrentUser, getUserProfileFirebase } from "../api/firebaseAuth";
import MapView, { Marker, Circle } from "react-native-maps";

export function timeAgo(date: Date) {
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

  //const getParamString = (value: string | string[] | undefined): string | undefined =>
    //Array.isArray(value) ? value[0] : typeof value === "string" ? value : undefined;

  const postId = params.id as string | undefined;
  /*
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
  */

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  //const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  //const [mapError, setMapError] = useState<string | null>(null);
  const [postAvatarUrl, setPostAvatarUrl] = useState<string | null>(null);
  const [authorEmail, setAuthorEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string | null>(null);
  const [editHistoryModalVisible, setEditHistoryModalVisible] = useState<boolean>(false);
  const [selectedEdits, setSelectedEdits] = useState<string[] | null>(null);
  const [post, setPost] = useState<PlaydatePostFirebase | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!postId) return;

    let isMounted = true;

    const loadPost = async () => {
      try {
        setLoadingMap(true);
        const data = await getPlaydatePostFirebase(postId);
        if (isMounted) setPost(data);
      } catch (err) {
        console.error("Failed to load post:", err);
      } finally {
        if (isMounted) setLoadingMap(false);
      }
    };

    loadPost();
    return () => {
      isMounted = false;
    };
  }, [postId]);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const authorProfile = await getUserProfileFirebase(post?.authorId || "");
        setPostAvatarUrl(authorProfile?.avatar || null);
        if (authorProfile?.publicEmail){
          setAuthorEmail(authorProfile.email);
        }
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

    if (post?.authorId) {
      fetchAvatar();
    }
  });

  const openInMaps = async () => {
    const address = post?.location.address?.trim();
    if (!address) return;

    const encodedAddress = encodeURIComponent(address);

    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?q=${encodedAddress}`
        : Platform.OS === "android"
        ? `geo:0,0?q=${encodedAddress}`
        : `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
      }
    } catch (e) {
      console.error("Failed to open maps:", e);
    }
  };

  const loadComments = async () => {
    if (!postId) return;
    setLoadingComments(true);
    const data = await getPlaydateCommentsFirebase(postId);
    const currentUser = getCurrentUser();
    const displayComments = await Promise.all(
      data.map(async (comment) => {
        const profile = await getUserProfileFirebase(comment.authorId);
        return {
          ...comment,
          avatar: profile?.avatar || "",
          yours: currentUser ? comment.authorId === currentUser.uid : false,
        };
      })
    );
    setComments(displayComments);
    setLoadingComments(false);
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handlePostComment = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !comment.trim()) return;
    if (!postId) {
      Alert.alert("Error", "Post ID is missing.");
      return;
    }

    await addPlaydateCommentFirebase({
      postId: postId,
      authorId: currentUser.uid,
      username: currentUser.displayName || "User",
      content: comment.trim(),
    });

    setComment("");
    loadComments();
  };

  /*
  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!post?.address || !post.city || !post.state) return;

      const fullAddress = `${post.address}, ${post.city}, ${post.state} ${post.zip ?? ""}`;
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
  }, [post?.address, post?.city, post?.state, post?.zip]);
  */

  const handleMenuOption = async (option: "Edit" | "Delete") => {
    console.log(`${option} clicked for post: ${selectedComment}`);
    if (!postId) {
      Alert.alert("Error", "Post ID is missing.");
      return;
    }

    if (option === "Delete") {
      try {
        if (!selectedComment) {
          Alert.alert("Error", "No comment selected.");
          return;
        }
        const response = await deletePlaydateCommentFirebase(selectedComment, postId);

        if (response.success) {
          loadComments();
          Alert.alert("Success", "Comment deleted successfully.");
        } else {
          Alert.alert("Error", "Failed to delete comment.");
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to delete comment.");
      }
    }
    if (option === "Edit") {
      setEditing(true);
    }

    setMenuVisible(false);
  };

  const handleEditComment = async () => {
    try {
      if (!selectedComment) {
        Alert.alert("Error", "No comment selected.");
        return;
      }
      if (!editedContent) {
        Alert.alert("Error", "Comment cannot be empty.");
        return;
      }

      const response = await editPlaydateCommentFirebase(selectedComment,editedContent);

      if (response.success) {
        loadComments();
        Alert.alert("Success", "Comment edited successfully.");
      } else {
        Alert.alert("Error", "Failed to edit comment.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to edit comment.");
    }
  };

  const isSpecificPlace = (types: string[]) => {
      return types.some(t =>
        [
          "street_address",
          "premise",
          "subpremise",
          "route",
          "park",
          "establishment",
          "point_of_interest",
        ].includes(t)
      );
    };
  
    const getRadiusFromViewport = (
      viewport: NonNullable<MapLocation["viewport"]>,
      centerLat: number
    ) => {
      const latDiff = Math.abs(viewport.northeast.lat - viewport.southwest.lat);
      const lngDiff = Math.abs(viewport.northeast.lng - viewport.southwest.lng);
  
      // Convert degrees → meters
      const latMeters = latDiff * 111_000;
      const lngMeters =
        lngDiff * 111_000 * Math.cos((centerLat * Math.PI) / 180);
  
      // Use diagonal and divide by 2 to get radius
      let radius = Math.sqrt(latMeters ** 2 + lngMeters ** 2) / 2.8;
  
      // ✅ Clamp radius to prevent absurd sizes
      radius = Math.min(Math.max(radius, 200), 25_000); // 200m–25km
  
      return radius;
    };
  
    const getRegionFromViewport = (
      viewport: NonNullable<MapLocation["viewport"]>
    ) => {
      const latitudeDelta =
        Math.abs(viewport.northeast.lat - viewport.southwest.lat) * 1.5; // padding
      const longitudeDelta =
        Math.abs(viewport.northeast.lng - viewport.southwest.lng) * 1.5;
      
      return { latitudeDelta, longitudeDelta };
    };

  const isPin = post?.location
    ? isSpecificPlace(post.location.types)
    : true;

  const dynamicRegion = post?.location
    ? isPin
      ? {
          latitude: post.location.latitude,
          longitude: post.location.longitude,
          latitudeDelta: 0.02,   // ✅ tight zoom for exact place
          longitudeDelta: 0.02,
        }
      : post.location.viewport
      ? {
          latitude: post.location.latitude,
          longitude: post.location.longitude,
          ...getRegionFromViewport(post.location.viewport), // ✅ zoom out for area
        }
      : {
          latitude: post.location.latitude,
          longitude: post.location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
    : undefined;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TouchableOpacity onPress={() => router.push({ pathname: "/userProfile", params: { authorId: post?.authorId } })}>
              <Image
                source={{ uri: postAvatarUrl || 'https://media.istockphoto.com/id/1444657782/vector/dog-and-cat-profile-logo-design.jpg?s=612x612&w=0&k=20&c=86ln0k0egBt3EIaf2jnubn96BtMu6sXJEp4AvaP0FJ0=' }}
                style={styles.profilePic}
              />
            </TouchableOpacity>
            <View>
              <TouchableOpacity onPress={() => router.push({ pathname: "/userProfile", params: { authorId: post?.authorId } })}>
                <Text style={styles.username}>{post?.username}</Text>
              </TouchableOpacity>
              <Text style={styles.time}>{timeAgo(post?.createdAt ?? new Date())}</Text>
            </View>
          </View>

          <Text style={styles.title}>{post?.title}</Text>
          <Text style={styles.subtitle}>{post?.locationName}</Text>
          <Text style={styles.subtitle}>{post?.whenAt}</Text>

          {/* --- DESCRIPTION --- */}
          <Text style={styles.description}>
            {post?.description ?? ''}

            {post?.edits && post.edits.length > 0 && (
              <Text
                onPress={() => {
                  setSelectedEdits(post.edits ?? []);
                  setEditHistoryModalVisible(true);
                }}
                style={{ color: "#666", fontSize: 10, marginLeft: 4 }}
              >
                (edited)
              </Text>
            )}
          </Text>

          {post?.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.image} />}

          {/* --- LOCATION / MAP --- */}
          <View style={{ marginTop: 12 }}>
            {loadingMap && <Text style={{ color: "#666" }}>Loading map...</Text>}

            {post?.location && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={openInMaps}
                style={styles.mapTouchable}
              >
                <MapView
                  style={{ flex: 1 }}
                  initialRegion={dynamicRegion}
                  region={dynamicRegion}
                  scrollEnabled={false}
                  zoomEnabled={false}
                >
                  {isSpecificPlace(post.location.types ?? []) ? (
                    <Marker
                      coordinate={{
                        latitude: post.location.latitude ?? 0,
                        longitude: post.location.longitude ?? 0,
                      }}
                    />
                  ) : post.location.viewport ? (
                    <Circle
                      center={{
                        latitude: post.location.latitude,
                        longitude: post.location.longitude,
                      }}
                      radius={getRadiusFromViewport(
                        post.location.viewport,
                        post.location.latitude
                      )}
                      strokeWidth={1}
                      fillColor="rgba(0,122,255,0.15)"
                    />
                  ) : null}
                </MapView>

                <View style={styles.mapBadge}>
                  <Ionicons name="navigate-outline" size={14} color="#fff" />
                  <Text style={styles.mapBadgeText}>Open in Maps</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* --- CONTACT INFO --- */}
          <Text style={[styles.description, { marginTop: 12 }]}>
            <Text style={{ color: "#555" }}>
              Contact info: {authorEmail ? authorEmail : "Unavailable"}
            </Text>
          </Text>

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
                  {/* Editing view */}
                  {editing && selectedComment === c.id ? (
                    <View style={{ marginTop: 4, flexDirection: "row", alignItems: "center" }}>
                      <TextInput
                        value={editedContent ?? c.content}
                        onChangeText={setEditedContent}
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: "#ccc",
                          borderRadius: 6,
                          padding: 8
                        }}
                        multiline
                      />

                      <TouchableOpacity
                        onPress={() => {
                          handleEditComment();
                          setEditing(false);
                          setEditedContent(null);
                          setSelectedComment(null);
                        }}
                        style={{ marginLeft: 8 }}
                      >
                        <Text style={{ color: "#007aff", fontWeight: "700" }}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    /* Normal non-editing text */
                    <Text style={{ marginTop: 4 }}>
                      {c.content}
                      {c.edits && c.edits.length > 0 && (
                        <Text
                          onPress={() => {
                            setSelectedComment(c.id);
                            setSelectedEdits(c.edits ?? []);
                            setEditHistoryModalVisible(true);
                          }}
                          style={{ color: "#666", fontSize: 10}}
                        >
                          (edited)
                        </Text>
                      )}
                    </Text>
                  )}

                </View>
                {/* "..." menu button ONLY for your comments */}
                {c.yours && (
                  <TouchableOpacity
                    style={styles.postMenuButton}
                    onPress={() => {
                      setMenuVisible(true);
                      setSelectedComment(c.id);
                    }}
                  >
                    <Text style={styles.postMenuText}>⋮</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
          {/* Modal for menu options */}
          <Modal
            visible={menuVisible}
            transparent
            onRequestClose = {() => setMenuVisible(false)}
          >
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
              <View style={styles.modalContent}>
                {["Edit", "Delete"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => handleMenuOption(option as "Edit" | "Delete" )}
                    style={styles.modalOption}
                  >
                    <Text style={styles.modalOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Modal for edit history */}
          <Modal
            visible={editHistoryModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setEditHistoryModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={() => setEditHistoryModalVisible(false)}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  justifyContent: "center",
                  padding: 20,
                }}
              >
                <TouchableWithoutFeedback>
                  <View
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 10,
                      padding: 20,
                      maxHeight: "70%",
                    }}
                  >
                    <ScrollView>
                      {selectedEdits?.map((text, idx) => (
                        <View
                          key={idx}
                          style={{
                            backgroundColor: "#f7f7f7",
                            padding: 12,
                            borderRadius: 8,
                            marginBottom: 12,
                          }}
                        >
                          <Text style={{ color: "#444" }}>{text}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

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
    marginTop: 10,
    fontSize: 15,
    color: "#333",
    marginBottom: 10,
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
  mapTouchable: { marginTop: 10, borderRadius: 12, overflow: "hidden", height: 200 },

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
  postMenuButton: {
    position: 'absolute',
    right: 8,
    zIndex: 10,
    padding: 4,
  },

  postMenuText: {
    fontSize: 18,
    fontWeight: '600',
  },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", borderRadius: 8, width: 200 },
  modalOption: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  modalOptionText: { fontSize: 16 },
});
