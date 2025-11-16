import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native'
import { signup } from "../api/auth";

export default function SignUp() {
  const router = useRouter()
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
  if (!email || !username || !password) {
    Alert.alert("Error", "Please fill out all fields");
    return;
  }

  setLoading(true);

  try {
    // Call modular Axios signup
    const data = await signup({ email, username, password });

    // Check backend 'ok' field
    if (data.ok) {
      setLoading(false);
      Alert.alert("Success", data.message, [
        {
          text: "OK",
          onPress: () => router.push("../profile"), // navigate to profile/login screen
        },
      ]);

      // Reset form
      setEmail("");
      setUsername("");
      setPassword("");
    } else {
      // Backend returned ok: false
      Alert.alert("Signup failed", data.message || "Something went wrong");
      setLoading(false);
      console.log(data.message)
    }
  } catch (error: any) {
    // Network error or HTTP error >=400
    const message = error.response?.data?.message || "Could not connect to server";
    Alert.alert("Signup failed", message);
    setLoading(false);
    console.error(error);
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.signUp}>
        <Text style={styles.title}>Sign Up</Text>

        <Text style={styles.account_create}>enter your email</Text>
        <TextInput
          style={styles.input}
          value = {email}
          onChangeText = {setEmail}
          placeholder = "enter your email"
          placeholderTextColor="#888"
          autoCapitalize='none'
          keyboardType='email-address'
        />
         
        <Text style={styles.account_create}>enter your username</Text>
        <TextInput
          style={styles.input}
          value = {username}
          onChangeText = {setUsername}
          placeholder = "enter your username"
          placeholderTextColor="#888"
          autoCapitalize='none'
        />

        <Text style={styles.account_create}>enter your password</Text>
        <TextInput
          style={styles.input}
          value = {password}
          onChangeText = {setPassword}
          placeholder = "enter your password"
          placeholderTextColor="#888"
          autoCapitalize='none'
        />

        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: "#aaa" }]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Signing Up..." : "Register"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    padding: 16,
    justifyContent: 'center',
  },
  signUp: {
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
    textAlign: 'center'
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
    marginBottom: 20
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center"
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: 600
  },
})