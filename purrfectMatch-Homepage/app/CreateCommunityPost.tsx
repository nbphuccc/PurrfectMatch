import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'

export default function ForgotPassword() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Post</Text>
      <Text style={styles.instructions}>add post here</Text>

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={{ color: '#fff' }}>Back</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12
  },
  instructions: {
    color: '#555',
    marginBottom: 20
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  }
})
