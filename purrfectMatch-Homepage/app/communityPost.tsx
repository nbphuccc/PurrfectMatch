import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal, TouchableWithoutFeedback } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getCommentsFirebase, addCommentFirebase, CommentFirebase, deleteCommunityCommentFirebase, editCommunityCommentFirebase } from '../api/community';
import { getCurrentUser, getUserProfileFirebase } from '../api/firebaseAuth';

const formatRelativeTime = (iso: string) => {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const diff = Date.now() - t;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) {
    return 'now';
  }
  if (diff < hour) {
    return `${Math.floor(diff / minute)}m`;
  }
  if (diff < day) {
    return `${Math.floor(diff / hour)}h`;
  }
  if (diff < 10 * day) {
    return `${Math.floor(diff / day)}d`;
  }
  const d = new Date(t);
  return `${d.getMonth() + 1}.${d.getDate()}.${d.getFullYear()}`;
};

const formatTimeValue = (v?: string | null) => {
  if (!v) return '';
  const parsed = Date.parse(v);
  if (Number.isNaN(parsed)) return v;
  return formatRelativeTime(v);
};

export type DisplayComment = CommentFirebase & {
  avatar: string, yours: boolean;
};

export default function PostDetail() {
  const params = useLocalSearchParams();
  const [comment, setComment] = useState('');
  const [commentsList, setCommentsList] = useState<DisplayComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [postAvatarUrl, setPostAvatarUrl] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string | null>(null);
  const [editHistoryModalVisible, setEditHistoryModalVisible] = useState<boolean>(false);

  const router = useRouter();

  const { id, user, authorId, time, petType, category, description, image } = params as Record<string, string | undefined>;

  const [, setTick] = useState(0);
  useEffect(() => {
    const idt = setInterval(() => setTick(t => t + 1), 30 * 1000);
    return () => clearInterval(idt);
  }, []);

  const loadComments = useCallback(
    async () => {
      if (!id || !authorId) return;

      setLoading(true);
      try {
        // Load post author's avatar
        const authorProfile = await getUserProfileFirebase(authorId);
        setPostAvatarUrl(authorProfile?.avatar || null);

        console.log("Loading comments from Firebase for post:", id);

        // Load comments
        const firebaseComments = await getCommentsFirebase(id);

        const currentUser = getCurrentUser();

        if (currentUser) {
          const userProfile = await getUserProfileFirebase(currentUser.uid);
          setAvatarUrl(userProfile?.avatar || null);
        }

        // Format each comment
        const formatted = await Promise.all(
          firebaseComments.map(async (c) => {
            const profile = await getUserProfileFirebase(c.authorId);
            console.log(c);
            return {
              ...c,
              avatar: profile?.avatar || null,
              yours: currentUser?.uid === c.authorId,
            };
          })
        );

        console.log(`Loaded ${formatted.length} comments from Firebase`);
        setCommentsList(formatted);
      } catch (err) {
        console.error("Error loading comments:", err);
      } finally {
        setLoading(false);
      }
    },
    [authorId, id]
  );

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const displayedTime = formatTimeValue(time);

  const handlePostComment = async () => {
    const trimmed = comment.trim();
    if (!trimmed || !id) return;

    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
      Alert.alert('Not Logged In', 'Please log in to comment.');
      return;
    }
    
    setSubmitting(true);
    try {
      console.log('Adding comment to Firebase...');
      console.log('Current user:', currentUser.uid, currentUser.displayName);
      await addCommentFirebase({
        postId: id as string,
        authorId: currentUser.uid,
        username: currentUser.displayName || 'User',
        content: trimmed,
      });
      
      console.log('Comment added! Reloading comments...');
      loadComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMenuOption = async (option: "Edit" | "Delete") => {
    console.log(`${option} clicked for post: ${selectedComment}`);

    if (option === "Delete") {
      try {
        if (!selectedComment) {
          Alert.alert("Error", "No comment selected.");
          return;
        }
        const response = await deleteCommunityCommentFirebase(selectedComment, id as string);

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

      const response = await editCommunityCommentFirebase(selectedComment,editedContent);

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

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // tweak if header height differs
    >
      <View style={styles.outer_container}>
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 40 }]}>
          <View style={styles.cardHeader}>
            {/* Avatar */}
            <TouchableOpacity onPress={() => router.push({ pathname: "/userProfile", params: { authorId: authorId } })}>
              <Image
                source={{
                  uri:
                    postAvatarUrl ||
                    'https://media.istockphoto.com/id/1444657782/vector/dog-and-cat-profile-logo-design.jpg?s=612x612&w=0&k=20&c=86ln0k0egBt3EIaf2jnubn96BtMu6sXJEp4AvaP0FJ0=',
                }}
                style={styles.profilePic}
              />
            </TouchableOpacity>
            {/* User info */}
            <View style={{ marginLeft: 12 }}>
              <TouchableOpacity onPress={() => router.push({ pathname: "/userProfile", params: { authorId: authorId } })}>
                <Text style={styles.user}>{user ?? 'Unknown'}</Text>
              </TouchableOpacity>
              <Text style={styles.time}>{displayedTime}</Text>
            </View>
          </View>

          {/* Meta info */}
          <Text style={styles.meta}>{petType ?? ''} • {category ?? ''}</Text>
          {/* Description */}
          <Text style={styles.description}>{description ?? ''}</Text>
          {image ? <Image source={{ uri: image }} style={styles.image} /> : null}
          
          <View style={{ marginTop: 30 }}>
            <View style={styles.commentInputRow}>
              <Image
                source={{ uri: avatarUrl || 'https://media.istockphoto.com/id/1444657782/vector/dog-and-cat-profile-logo-design.jpg?s=612x612&w=0&k=20&c=86ln0k0egBt3EIaf2jnubn96BtMu6sXJEp4AvaP0FJ0=' }}
                style={styles.avatar}
              />

              <TextInput
                style={styles.input}
                value={comment}
                onChangeText={setComment}
                placeholder="Write a comment..."
                placeholderTextColor="#888"
                multiline
                editable={!submitting}
              />

              <TouchableOpacity
                onPress={handlePostComment}
                style={[styles.postButton, (!comment.trim() || submitting) && { opacity: 0.45 }]}
                disabled={!comment.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.postButtonText}>Post</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 12 }}>
              {loading ? (
                <Text style={{ color: '#888', textAlign: 'center' }}>Loading comments...</Text>
              ) : commentsList.length === 0 ? (
                <Text style={{ color: '#888' }}>No comments yet - be the first to comment.</Text>
              ) : (
                commentsList.map(c => (
                  <View key={c.id} style={styles.commentRow}>
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: "/userProfile", params: { authorId: c.authorId } })}
                    >
                      <Image source={{ uri: c.avatar || 'https://media.istockphoto.com/id/1444657782/vector/dog-and-cat-profile-logo-design.jpg?s=612x612&w=0&k=20&c=86ln0k0egBt3EIaf2jnubn96BtMu6sXJEp4AvaP0FJ0=' }} style={styles.commentAvatar} />
                    </TouchableOpacity>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity
                          onPress={() => router.push({ pathname: "/userProfile", params: { authorId: c.authorId } })}
                        >
                          <Text style={{ fontWeight: '700', marginRight: 8 }}>{c.username}</Text>
                        </TouchableOpacity>
                        <Text style={{ color: '#666', fontSize: 12 }}>
                          {formatTimeValue(c.createdAt.toISOString())}
                        </Text>
                        {c.edits && c.edits.length > 0 && (
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedComment(c.id);
                              setEditHistoryModalVisible(true);
                            }}
                          >
                            <Text style={{ color: '#666', fontSize: 12, marginLeft: 4 }}>
                              (edited)
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      {/* Editing View */}
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
                        <Text style={{ marginTop: 4 }}>{c.content}</Text>
                      )}
                    </View>
                    {/* "..." menu button ONLY for your comments */}
                    {c.yours && !editing && (
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
                animationType="slide"
              >
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
                  <View style={styles.modalContent}>
                    {["Edit", "Delete"].map((option) => (
                      <TouchableOpacity
                        key={option}
                        onPress={() => handleMenuOption(option as "Edit" | "Delete", )}
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
                transparent={true}
                animationType="slide"
                onRequestClose={() => setEditHistoryModalVisible(false)}
              >
                <TouchableWithoutFeedback onPress={() => setEditHistoryModalVisible(false)}>
                  <View style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    justifyContent: "center",
                    padding: 20,
                  }}>
                    <TouchableWithoutFeedback>
                      <View style={{
                        backgroundColor: "#fff",
                        borderRadius: 10,
                        padding: 20,
                        maxHeight: "70%",
                      }}>
                        <ScrollView>
                          {(() => {
                            const comment = commentsList.find(x => x.id === selectedComment);
                            return comment?.edits?.map((text, idx) => (
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
                            ));
                          })()}
                        </ScrollView>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>

            </View>
          </View>
        </ScrollView>
      </View>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer_container: {
    flex: 1,
    alignContent: "center"
  },
  container: { 
    padding: 16, 
    backgroundColor: '#fff', 
    minHeight: '100%' 
  },
  user: { 
    fontSize: 20, 
    fontWeight: '700' 
  },

  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  profilePic: { width: 50, height: 50, borderRadius: 25},

  time: { 
    color: '#666', 
    marginTop: 4 
  },
  meta: { 
    color: '#444', 
    marginTop: 8 
  },
  image: { 
    width: '100%', 
    height: 300, 
    borderRadius: 8, 
    marginTop: 12, 
    resizeMode: 'contain',
    backgroundColor: '#f0f0f0', 
  },
  description: { 
    marginTop: 12, 
    fontSize: 16, 
    color: '#222' 
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
    marginBottom: 0,
    flex: 1,
    minHeight: 44,
    maxHeight: 140,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  postButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
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