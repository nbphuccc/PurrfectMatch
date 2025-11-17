import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { getCommentsFirebase, addCommentFirebase } from '../api/community';

// lightweight relative formatter (matches feed behavior)
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

export default function PostDetail() {
  const params = useLocalSearchParams();
  const [comment, setComment] = useState('');
  const [commentsList, setCommentsList] = useState<Array<{ id: number; user: string; avatar?: string; text: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const { id, user, time, petType, category, description, image, likes, comments } = params as Record<string, string | undefined>;

  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const idt = setInterval(() => setTick(t => t + 1), 30 * 1000);
    return () => clearInterval(idt);
  }, []);

  // Load comments from Firebase
  React.useEffect(() => {
    let mounted = true;
    const loadComments = async () => {
      if (!id) return;
      setLoading(true);
      try {
        console.log('Loading comments from Firebase for post:', id);
        const firebaseComments = await getCommentsFirebase(id);
        if (!mounted) return;
        
        const formatted = firebaseComments.map((c, idx) => ({
          id: idx + 1,
          user: c.username,
          avatar: 'https://media.istockphoto.com/id/1444657782/vector/dog-and-cat-profile-logo-design.jpg?s=612x612&w=0&k=20&c=86ln0k0egBt3EIaf2jnubn96BtMu6sXJEp4AvaP0FJ0=',
          text: c.content,
          created_at: c.createdAt.toISOString(),
        }));
        
        console.log(`✅ Loaded ${formatted.length} comments from Firebase`);
        setCommentsList(formatted);
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadComments();
    return () => { mounted = false; };
  }, [id]);

  const displayedTime = formatTimeValue(time);

  // 🔥 Submit comment to Firebase
  const handlePostComment = async () => {
    const trimmed = comment.trim();
    if (!trimmed || !id) return;
    
    setSubmitting(true);
    try {
      console.log('Adding comment to Firebase...');
      await addCommentFirebase({
        postId: id as string,
        authorId: 1, // TODO: Replace with actual user ID
        username: 'GuestUser', // TODO: Replace with actual username
        content: trimmed,
      });
      
      console.log('Comment added! Reloading comments...');
      
      // Reload comments from Firebase
      const firebaseComments = await getCommentsFirebase(id);
      const formatted = firebaseComments.map((c, idx) => ({
        id: idx + 1,
        user: c.username,
        avatar: 'https://media.istockphoto.com/id/1444657782/vector/dog-and-cat-profile-logo-design.jpg?s=612x612&w=0&k=20&c=86ln0k0egBt3EIaf2jnubn96BtMu6sXJEp4AvaP0FJ0=',
        text: c.content,
        created_at: c.createdAt.toISOString(),
      }));
      
      setCommentsList(formatted);
      setComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.outer_container}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.user}>{user ?? 'Unknown'}</Text>
        <Text style={styles.time}>{displayedTime}</Text>
        <Text style={styles.meta}>{petType ?? ''} • {category ?? ''}</Text>
        <Text style={styles.description}>{description ?? ''}</Text>
        {image ? <Image source={{ uri: image }} style={styles.image} /> : null}
        
        <View style={{ marginTop: 30 }}>
          <View style={styles.commentInputRow}>
            <Image
              source={{ uri: 'https://media.istockphoto.com/id/1444657782/vector/dog-and-cat-profile-logo-design.jpg?s=612x612&w=0&k=20&c=86ln0k0egBt3EIaf2jnubn96BtMu6sXJEp4AvaP0FJ0=' }}
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

          {/* Comments list */}
          <View style={{ marginTop: 12 }}>
            {loading ? (
              <Text style={{ color: '#888', textAlign: 'center' }}>Loading comments...</Text>
            ) : commentsList.length === 0 ? (
              <Text style={{ color: '#888' }}>No comments yet - be the first to comment.</Text>
            ) : (
              commentsList.map(c => (
                <View key={c.id} style={styles.commentRow}>
                  <Image source={{ uri: c.avatar }} style={styles.commentAvatar} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontWeight: '700', marginRight: 8 }}>{c.user}</Text>
                      <Text style={{ color: '#666', fontSize: 12 }}>{formatTimeValue(c.created_at)}</Text>
                    </View>
                    <Text style={{ marginTop: 4 }}>{c.text}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
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
});