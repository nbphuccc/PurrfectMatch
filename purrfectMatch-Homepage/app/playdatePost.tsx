import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  getPlaydateCommentsFirebase,
  addPlaydateCommentFirebase,
} from "../api/playdates";
import { getCurrentUser } from "../api/firebaseAuth";

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

  const getParamString = (
    value: string | string[] | undefined
  ): string | undefined => {
    if (Array.isArray(value)) return value[0];
    if (typeof value === "string") return value;
    return undefined;
  };

  const postId = getParamString(params.id) || "";
  const title = getParamString(params.title) || "Playdate";
  const location = getParamString(params.location) || "Location: TBD";
  const date = getParamString(params.date) || "Date: TBD";
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

  const loadComments = async () => {
    if (!postId) return;
    setLoadingComments(true);
    const data = await getPlaydateCommentsFirebase(postId);
    setComments(data);
    setLoadingComments(false);
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handlePostComment = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    if (!comment.trim()) return;

    await addPlaydateCommentFirebase({
      postId: postId,
      authorId: currentUser.uid,
      username: currentUser.displayName || "User",
      content: comment.trim(),
    });

    setComment("");
    loadComments(); 
  };

  return (
    <ScrollView style={styles.container}>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Image
            source={{
              uri: "https://media.istockphoto.com/id/1444657782/vector/dog-and-cat-profile-logo-design.jpg",
            }}
            style={styles.profilePic}
          />
          <View>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.time}>{time}</Text>
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{location}</Text>
        <Text style={styles.subtitle}>{date}</Text>

        {image ? <Image source={{ uri: image }} style={styles.image} /> : null}

        <Text style={styles.description}>{description}</Text>
      </View>

      {/* Comment input */}
      <View style={styles.commentContainer}>
        <Ionicons name="paw-outline" size={22} color="#444" />
        <TextInput
          style={styles.commentInput}
          placeholder="Write a comment..."
          value={comment}
          onChangeText={setComment}
        />
        <TouchableOpacity style={styles.postButton} onPress={handlePostComment}>
          <Text style={{ color: "white", fontWeight: "600" }}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Comments list */}
      <View style={{ marginTop: 20 }}>
        {loadingComments ? (
          <Text style={{ color: "#666" }}>Loading comments...</Text>
        ) : comments.length === 0 ? (
          <Text style={{ color: "#666" }}>No comments yet — be the first!</Text>
        ) : (
          comments.map((c, index) => (
            <View key={index} style={styles.commentItem}>
              <Image
                source={{
                  uri: "https://media.istockphoto.com/id/1444657782/vector/dog-and-cat-profile-logo-design.jpg",
                }}
                style={styles.commentProfile}
              />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <Text style={styles.commentUsername}>{c.username}</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
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
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
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
  commentContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
  },
  postButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  commentItem: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  commentProfile: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ddd",
  },
  commentUsername: {
    fontWeight: "600",
    fontSize: 14,
  },
  commentTime: {
    color: "#888",
    fontSize: 12,
  },
  commentContent: {
    fontSize: 14,
    marginTop: 2,
    color: "#333",
  },
});
