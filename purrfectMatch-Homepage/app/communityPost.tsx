import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

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
  const router = useRouter();

  // params.time is expected to be the raw ISO `created_at` string (or empty)
  const { id, user, time, petType, category, description, image, likes, comments } = params as Record<string, string | undefined>;

  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const idt = setInterval(() => setTick(t => t + 1), 30 * 1000);
    return () => clearInterval(idt);
  }, []);

  const displayedTime = formatTimeValue(time);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.user}>{user ?? 'Unknown'}</Text>
      <Text style={styles.time}>{displayedTime}</Text>
      <Text style={styles.meta}>{petType ?? ''} • {category ?? ''}</Text>
      <Text style={styles.description}>{description ?? ''}</Text>
      {image ? <Image source={{ uri: image }} style={styles.image} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
