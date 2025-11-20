import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { getCurrentUser } from '../api/firebaseAuth';

type Comment = {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: Date;
};

type CreateCommentsProps = {
  postId: string;
  fetchComments: (postId: string) => Promise<Comment[]>;
  addComment: (data: { postId: string; userId: string; username: string; text: string }) => Promise<void>;
};

export default function CreateComments({ postId, fetchComments, addComment }: CreateCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const loadComments = async () => {
    try {
      const data = await fetchComments(postId);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handleAddComment = async () => {
    const user = getCurrentUser();
    
    if (!user) {
      Alert.alert('Not Logged In', 'Please log in to comment.');
      return;
    }

    if (!newComment.trim()) {
      Alert.alert('Empty Comment', 'Please write something.');
      return;
    }

    setLoading(true);

    try {
      console.log('Adding comment to Firebase...');
      await addComment({
        postId,
        userId: user.uid,
        username: user.displayName || 'User',
        text: newComment.trim(),
      });

      console.log('Comment added! Reloading comments...');
      setNewComment("");
      await loadComments();
    } catch (error) {
      console.error("Failed to add comment:", error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Comments ({comments.length})</Text>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.commentText}>{item.text}</Text>
            <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Write a comment..."
          placeholderTextColor="#888"
          multiline
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAddComment}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  comment: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  username: {
    fontWeight: '600',
    marginBottom: 4,
  },
  commentText: {
    color: '#333',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});