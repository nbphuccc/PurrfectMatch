import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function PostDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const { id, user, time, petType, category, description, image, likes, comments } = params as Record<string, string | undefined>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.user}>{user ?? 'Unknown'}</Text>
      <Text style={styles.time}>{time ?? ''}</Text>
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
