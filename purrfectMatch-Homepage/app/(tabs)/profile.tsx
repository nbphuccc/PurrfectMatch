import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, Platform } from 'react-native';
import { loginFirebase, logoutFirebase } from '../../api/firebaseAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';

export default function Profile() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; email: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          id: user.uid,
          email: user.email!,
          username: user.displayName || 'User',
        });
        setIsLoggedIn(true);
        console.log('User logged in:', user.email);
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
        console.log('User logged out');
      }
    });

    return unsubscribe;
  }, []);

  const handleLogIn = async () => {
    setErrorMessage(null);
    
    if (!email || !password) {
      setErrorMessage('Please fill out both fields');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting Firebase login...');
      const result = await loginFirebase({ email, password });

      if (result.ok) {
        console.log('Login successful');
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
        console.log('Login failed:', result.message);
        setErrorMessage(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Could not connect to Firebase');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutFirebase();
    setEmail('');
    setPassword('');
    setErrorMessage(null);
    
    if (Platform.OS === 'web') {
      alert('You have been signed out.');
    } else {
      Alert.alert('Logged out', 'You have been signed out.');
    }
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.login}>
          <Text style={styles.title}>Login</Text>

          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          )}

          <Text style={styles.account_create}>Email</Text>
          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrorMessage(null); // Clear error when typing
            }}
            placeholder="e.g., user@example.com"
            placeholderTextColor="#888"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <Text style={styles.account_create}>Password</Text>
          <TextInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrorMessage(null); // Clear error when typing
            }}
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

  return (
    <View style={styles.container}>
      <View style={styles.login}>
        <Text style={styles.title}>Welcome, {currentUser?.username}!</Text>
        <Text style={{ textAlign: 'center', color: '#555', marginBottom: 8 }}>
          {currentUser?.email}
        </Text>
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
  errorContainer: {
    backgroundColor: '#fee',
    borderLeftWidth: 4,
    borderLeftColor: '#f00',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
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
});