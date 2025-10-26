import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const posts = [
  { id: '1', user_id: 'Alice', description: 'Excited to join this community!', type: 'community' },
  { id: '2', user_id: 'Bob', description: 'Anyone attending the event this weekend?', type: 'community' },
  { id: '3', user_id: 'Clara', description: 'Anyone can help me look out for my dog around 3:00pm on October 21?', type: 'community' },
];


export default function CommunityScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      
      {/* Posts */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.post}>
            <Text style={styles.author}>{item.user_id}</Text>
            <Text style={styles.content}>{item.description }</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <Ionicons name="heart-outline" size={20} color="#333" />
              <Ionicons name="chatbox-outline" size={20} color="#333" />
            </View>
            
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      
      <TouchableOpacity style={styles.fab} 
        onPress={() => {router.push('../CreateCommunityPost')}}> 
        <Ionicons name="add" size={28} color="#fff" /> 
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 16 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#333' 
  },
  post: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
  },
  author: { 
    fontWeight: '600', 
    marginBottom: 4 
  },
  content: { 
    color: '#444' 
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#4A90E2',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
});
