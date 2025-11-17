import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

// lightweight relative formatter (matches feed behavior)
const formatRelativeTime = (iso: string) => {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const diff = Date.now() - t;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return 'now';
  if (diff < hour) return `${Math.floor(diff / minute)}m`;
  if (diff < day) return `${Math.floor(diff / hour)}h`;
  if (diff < 30 * day) return `${Math.floor(diff / day)}d`;
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
  const router = useRouter();

  const { id, user, time, petType, category, description, image, likes, comments } = params as Record<string, string | undefined>;

  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const idt = setInterval(() => setTick(t => t + 1), 30 * 1000);
    return () => clearInterval(idt);
  }, []);

  const displayedTime = formatTimeValue(time);

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
            />

            <TouchableOpacity
              onPress={() => {
                const trimmed = comment.trim();
                if (!trimmed) return;
                const newComment = {
                  id: Date.now(),
                  user: 'You',
                  avatar: 'https://media.istockphoto.com/id/1444657782/vector/dog-and-cat-profile-logo-design.jpg?s=612x612&w=0&k=20&c=86ln0k0egBt3EIaf2jnubn96BtMu6sXJEp4AvaP0FJ0=',
                  text: trimmed,
                  created_at: new Date().toISOString(),
                };
                setCommentsList(prev => [newComment, ...prev]);
                setComment('');
              }}
              style={[styles.postButton, !comment.trim() && { opacity: 0.45 }]}
              disabled={!comment.trim()}
            >
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>

          {/* Comments list */}
          <View style={{ marginTop: 12 }}>
            {commentsList.length === 0 ? (
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
    height: 240, 
    borderRadius: 8, 
    marginTop: 12, 
    resizeMode: 'cover' 
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
