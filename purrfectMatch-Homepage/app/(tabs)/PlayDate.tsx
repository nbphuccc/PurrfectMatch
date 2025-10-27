import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const posts = [
  { id: '1', user_id: 'Alice', title: "Dog PlayDate", description: 'My energetic Golden Retriever, Sunny, is looking for playmates! He loves chasing balls and is great with dogs of all sizes. Perfect for high-energy pups who need to burn off some steam!', type: 'playdate', location_city: "Discovery Park, Seattle, WA" },
  { id: '2', user_id: 'Bob', title: "Walk Together", description: 'My shy rescue pup, Luna, needs some confident walking buddies to help build her confidence. She\'s a 2-year-old Border Collie mix who would love gentle, patient dog friends for weekend trail walks.', type: 'playdate', location_city: "Westcrest Park, Seattle, WA" },
  { id: '3', user_id: 'Clara', title: "Dog Park", description: 'Bring your furry friends for some off-leash fun! My two French Bulldogs, Buster and Bella, are social butterflies who love making new friends. We usually hang out near the agility equipment. All friendly dogs welcome!', type: 'playdate', location_city: "U District Area" },
];

function PlayDate() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <FlatList
      data ={posts}
      keyExtractor={(item) => item.id}
      renderItem={({item}) => (
        <View style={styles.post}>
          {/* <Text style={styles.author}>{item.user_id}</Text> */}
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.location}>location: {item.location_city}</Text>
          <Text style={styles.content}>{item.description}</Text>
        </View>
      )}
      />

      <TouchableOpacity style={styles.fab} 
        onPress={() => { router.push('../CreatePlaydatePost') }} 
      >
        <Ionicons name="add" size={28} color="#fff" /> 
      </TouchableOpacity>
    </View>
  )
}

export default PlayDate

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 16 
  },
  post: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
  },
  title: { 
    fontSize: 20, 
    fontWeight: '400', 
    color: '#333',
    marginBottom: 5,
  },
  location: {
    fontSize: 12, 
    marginBottom: 4,
    color: '#333'
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
})