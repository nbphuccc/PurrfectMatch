import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const profile = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.login}>
        <Text style={styles.title}>Login</Text>

        <Text style={styles.account_create}>Username or Email</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username or email"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.account_create}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          style={styles.input}
          autoCapitalize="none"
        />

        <TouchableOpacity
          onPress={() => { router.push('../forgotPassword') }}
          style={{ alignSelf: 'flex-end', marginBottom: 20 }}>
          <Text style={{ color: '#7b7b7bff', textDecorationLine: 'underline' }}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.login_button}
          onPress={() => {console.log('Login pressed', username, password)}}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>LOGIN</Text>
        </TouchableOpacity>

        <Text style={{fontSize: 14, color: '#747373ff', textAlign: 'center', marginBottom: 10}}>Or create an account</Text>

        <TouchableOpacity
          onPress={() => { router.push('../signup') }}
          style={{ alignSelf: 'center', marginBottom: 20 }}>
          <Text style={{ color: '#6d6d6dff', textDecorationLine: 'underline' }}>SIGN UP</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    padding: 16,
    justifyContent: 'center', // center the box vertically
  },
  login: {
    backgroundColor: '#fff',
    padding: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius:10
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  account_create: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
    marginBottom: 10
  },
  login_button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30
  },
  create_account_button: {

  }
})