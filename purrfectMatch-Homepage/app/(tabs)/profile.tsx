import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, Platform } from 'react-native';

const profile = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const router = useRouter();

  const handleLogIn = async () => {
    if (!username || !password) {
      if (Platform.OS === 'web') {
        alert('Please fill out both fields');
      } else {
        Alert.alert("Error", "Please fill out both fields");
      }
      return;
    }

    setLoading(true);

    try {
      const isEmail = username.includes('@'); // detect if it's an email
      const loginData = isEmail
      ? { email: username, password }
      : { username, password };

      const response = await fetch("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsLoggedIn(true);
        if (Platform.OS === 'web') {
          alert('Signed in successfully');
          router.replace('/');
        } else {
          Alert.alert('Success', 'Signed in successfully', [
            {
              text: 'OK',
              onPress: () => router.replace('/'),
            },
          ]);
        }
      } else {
        if (Platform.OS === 'web') {
          alert(data.message || 'Something went wrong');
        } else {
          Alert.alert("Signin failed", data.message || "Something went wrong");
        }
      }

    } catch (error) {
      console.error(error);
      if (Platform.OS === 'web') {
        alert('Could not connect to server');
      } else {
        Alert.alert("Error", "Could not connect to server");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    if (Platform.OS === 'web') {
      alert('You have been signed out.');
    } else {
      Alert.alert('Logged out', 'You have been signed out.');
    }
  };

  //If user is NOT logged in, show login screen
  if(!isLoggedIn){
    return (
      <View style={styles.container}>
        <View style={styles.login}>
          <Text style={styles.title}>Login</Text>

          <Text style={styles.account_create}>Username or Email</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username or email"
            placeholderTextColor="#888"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.account_create}>Password</Text>
          <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          placeholderTextColor="#888" 
          style={styles.input}
          autoCapitalize="none"
          secureTextEntry={true}
          />

          <TouchableOpacity
            onPress={() => { router.push('../forgotPassword') }}
            style={{ alignSelf: 'flex-end', marginBottom: 20 }}>
            <Text style={styles.forgot_password}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.login_button}
            disabled={loading}
            onPress={handleLogIn}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '600' }}>LOGIN</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.create_an_account}>Or create an account</Text>

          <TouchableOpacity
            onPress={() => { router.push('../signup') }}
            style={{ alignSelf: 'center', marginBottom: 20 }}>
            <Text style={styles.signup_text}>SIGN UP</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  //If user IS logged in, show profile screen
  return (
      <View style={styles.container}>
      <View style={styles.login}>
        <Text style={styles.title}>Welcome, {username}!</Text>
        <Text style={{ textAlign: 'center', color: '#555', marginBottom: 20 }}>
          You are now logged in.
        </Text>

        <TouchableOpacity style={styles.login_button} onPress={handleLogout}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>LOGOUT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    padding: 16,
    justifyContent: 'center', 
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
  forgot_password: {
    color: '#7b7b7bff', 
    textDecorationLine: 'underline'
  },
  login_text: {
    color: '#fff', 
    fontWeight: '600'
  },
  create_an_account: {
    fontSize: 14, 
    color: '#747373ff', 
    textAlign: 'center', 
    marginBottom: 10
  },
  signup_text: {
    color: '#6d6d6dff', 
    textDecorationLine: 'underline'
  }
})