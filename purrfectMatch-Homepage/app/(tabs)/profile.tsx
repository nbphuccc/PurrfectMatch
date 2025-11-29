import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, Platform, ScrollView, Image, Switch } from 'react-native';
import { loginFirebase, logoutFirebase, setUserProfileFirebase, getUserProfileFirebase, ProfileFirebase, updateProfileFirebase} from '../../api/firebaseAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { listCommunityPostsFirebase, CommunityPostFirebase } from '../../api/community';
import { listPlaydatesFirebase, PlaydatePostFirebase } from '../../api/playdates';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {getCurrentUser} from '../../api/firebaseAuth';

export default function Profile() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; email: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<(CommunityPostFirebase & { id: string; type: 'community' })[]>([]);
  const [userPlaydates, setUserPlaydates] = useState<PlaydatePostFirebase[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [profile, setProfile] = useState<ProfileFirebase | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState<string>("");
  const [editedBio, setEditedBio] = useState<string>("");
  const [emailIsPublic, setEmailIsPublic] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser({
          id: user.uid,
          email: user.email!,
          username: user.displayName || 'User',
        });
        setIsLoggedIn(true);
        console.log('User logged in:', user.email);
        // Load user's posts when logged in
        loadUserPosts(user.uid);
        const currProfile = await getUserProfileFirebase(user.uid);

        if (!currProfile) {
          // Create missing profile
          const result = await setUserProfileFirebase(user.uid, {
            email: user.email!,
            username: user.displayName || "User",
            name: "",
            bio: "",
            avatar: 'https://media.istockphoto.com/id/1444657782/vector/dog-and-cat-profile-logo-design.jpg?s=612x612&w=0&k=20&c=86ln0k0egBt3EIaf2jnubn96BtMu6sXJEp4AvaP0FJ0=',
            publicEmail: false,
          });

          if (!result.success) {
            console.error("Failed to create user profile. Account exists without profile?");
          }
        }
        // Fetch the newly created profile
        const finalProfile = await getUserProfileFirebase(user.uid);
        setProfile(finalProfile);
        setEditedName(finalProfile?.name || "");
        setEditedBio(finalProfile?.bio || "");
        setEmailIsPublic(finalProfile?.publicEmail || false);
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
        setUserPosts([]);
        setUserPlaydates([]);
        setProfile(null);
        setEditedName("");
        setEditedBio("");
        setEmailIsPublic(false);
        console.log('User logged out');
      }
    });
    return () => unsubscribe();
  }, []);

  
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission needed to access photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1.0,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const localUri = asset.uri;

      const response = await fetch(localUri);
      const blob = await response.blob();

      const storage = getStorage();
      const storageRef = ref(storage, `avatars/${currentUser?.id}.jpg`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);

      await setUserProfileFirebase(currentUser!.id, {
        ...profile!,
        avatar: downloadURL,
      });

      setProfile({
        ...profile!,
        avatar: downloadURL,
      });
    }
  };

  const loadUserPosts = React.useCallback(async (userId: string) => {
    setLoadingPosts(true);
    try {
      // Fetch community posts
      const allCommunityPosts = await listCommunityPostsFirebase();
      const userCommunityPosts = allCommunityPosts
        .filter(post => post.authorId === userId)
        .map(post => ({ ...post, type: 'community' as const }));

      // Fetch playdates
      const allPlaydates = await listPlaydatesFirebase();
      const userPlaydatePosts = allPlaydates.filter(post => post.authorId === userId);

      setUserPosts(userCommunityPosts);
      setUserPlaydates(userPlaydatePosts);
      console.log(`Loaded ${userCommunityPosts.length} community posts and ${userPlaydatePosts.length} playdates`);
    } catch (error) {
      console.error('Error loading user posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused, refreshing posts...');
      const currentUser = getCurrentUser();
      loadUserPosts(currentUser?.uid || "");
    }, [loadUserPosts])
  );

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

  const handleSaveProfile = async (name: string, bio: string) => {
    try {
      if (!currentUser) return;
      await updateProfileFirebase(currentUser.id, {
        name: name.trim(),
        bio: bio.trim(),
        publicEmail: emailIsPublic,
      });
      setProfile(prev => prev ? { ...prev, name, bio } : prev);
      console.log("Profile saved!");
    } catch (e) {
      console.error("Failed to update profile:", e);
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
    <ScrollView style={styles.container} keyboardShouldPersistTaps="always">
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handlePickImage}>
            <Image
              source={{ uri: profile?.avatar }}
              style={styles.profilePic}
            />
            <View style={styles.cameraOverlay}>
              <MaterialIcons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.username}>{currentUser?.username}</Text>
        <Text style={styles.email}>{currentUser?.email}</Text>
        
        {/* show number of posts (playdate, community) */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userPosts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userPlaydates.length}</Text>
            <Text style={styles.statLabel}>Playdates</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userPosts.length + userPlaydates.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfoBox}>
        {/* Name */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>

          {isEditing ? (
            <TextInput
              style={styles.inputField}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Enter your name"
            />
          ) : (
            <Text style={styles.infoValue}>
              {profile?.name ? profile.name : "Not set"}
            </Text>
          )}
          <View style={styles.infoDivider} />
        </View>

        {/* Email */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>

          {isEditing ? (
            // Show toggle when editing
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={styles.infoValue}>
                {emailIsPublic ? "Public" : "Private"}
              </Text>

              <Switch
                value={emailIsPublic}
                onValueChange={(value: boolean) => setEmailIsPublic(value)}
              />
            </View>
          ) : (
            // Normal view mode
            <Text style={styles.infoValue}>
              {emailIsPublic ? "Public" : "Private"}
            </Text>
          )}

          <View style={styles.infoDivider} />
        </View>

        {/* Bio */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bio</Text>

          {isEditing ? (
            <TextInput
              style={[styles.inputField, { height: 80 }]}
              value={editedBio}
              onChangeText={setEditedBio}
              placeholder="Enter your bio"
              multiline
            />
          ) : (
            <Text style={styles.infoValue}>
              {profile?.bio ? profile.bio : "Not set"}
            </Text>
          )}
        </View>

        {/* Edit / Save button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            if (isEditing) {
              // Apply changes here
              handleSaveProfile(editedName, editedBio);
            }
            setIsEditing(prev => !prev);
          }}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? "Apply Changes" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* User's Posts Section */}
      <View style={styles.postsSection}>
        <Text style={styles.sectionTitle}>My Posts</Text>
        
        {loadingPosts ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
        ) : (
          <>
            {userPosts.length === 0 && userPlaydates.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No posts yet</Text>
                <Text style={styles.emptyStateSubtext}>Start sharing with the community!</Text>
              </View>
            ) : (
              <>
                {/* Community Posts */}
                {userPosts.length > 0 && (
                  <View style={styles.postTypeSection}>
                    <Text style={styles.postTypeTitle}>Community Posts ({userPosts.length})</Text>
                    {userPosts.map((post) => (
                      <TouchableOpacity
                        key={post.id}
                        activeOpacity={0.8}
                        onPress={() => {
                          router.push({
                            pathname: '../communityPost',
                            params: {
                              id: post.id,
                              user: post.username,
                              authorId: post.authorId,
                              time: post.createdAt.toISOString() ?? '',
                              petType: post.petType,
                              category: post.category,
                              description: post.description,
                              image: post.imageUrl ? encodeURIComponent(post.imageUrl) : '',
                            },
                          });
                        }}
                      >
                        <View style={styles.postCard}>
                          <View style={styles.postHeader}>
                            <View style={styles.postBadge}>
                              <Text style={styles.postBadgeText}>{post.category}</Text>
                            </View>
                            <View style={styles.postBadge}>
                              <Text style={styles.postBadgeText}>{post.petType}</Text>
                            </View>
                          </View>
                          <Text style={styles.postDescription}>{post.description}</Text>
                          {post.imageUrl && (
                            <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
                          )}
                          <View style={styles.postFooter}>
                            <Text style={styles.postStats}>{post.likes} likes</Text>
                            <Text style={styles.postStats}>{post.comments} comments</Text>
                            <Text style={styles.postDate}>
                              {post.createdAt.toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Playdates */}
                {userPlaydates.length > 0 && (
                  <View style={styles.postTypeSection}>
                    <Text style={styles.postTypeTitle}>Playdates ({userPlaydates.length})</Text>
                    {userPlaydates.map((playdate) => (
                      <TouchableOpacity
                        key={playdate.id}
                        activeOpacity={0.8}
                        onPress={() =>
                          router.push({
                            pathname: "/playdatePost",
                            params: {
                              id: playdate.id,
                              authorId: playdate.authorId,
                              title: playdate.title,
                              user: playdate.username,
                              time: playdate.createdAt.toLocaleString(),
                              description: playdate.description,
                              location: `${playdate.city}, ${playdate.state}`,
                              date: playdate.whenAt,
                              image: playdate.imageUrl ? encodeURIComponent(playdate.imageUrl) : "",
                              address: playdate.address ?? "",
                              city: playdate.city,
                              state: playdate.state,
                              zip: playdate.zip ?? "",
                            },
                          })
                        }
                      >
                        <View style={styles.postCard}>
                          <Text style={styles.playdateTitle}>{playdate.title}</Text>
                          <View style={styles.playdateInfo}>
                            <Text style={styles.playdateLabel}>{playdate.dogBreed}</Text>
                            <Text style={styles.playdateLabel}>{playdate.city}, {playdate.state}</Text>
                          </View>
                          <Text style={styles.postDescription}>{playdate.description}</Text>
                          <View style={styles.playdateDetails}>
                            <Text style={styles.playdateDetailText}>{playdate.whenAt}</Text>
                            <Text style={styles.playdateDetailText}>{playdate.place}</Text>
                          </View>
                          {playdate.imageUrl && (
                            <Image source={{ uri: playdate.imageUrl }} style={styles.postImage} />
                          )}
                          <View style={styles.postFooter}>
                            <Text style={styles.postDate}>
                              {playdate.createdAt.toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

              </>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },
  login: {
    backgroundColor: '#fff',
    padding: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius:10,
    margin: 16,
    marginTop: 100,
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
  },
  // Profile page styles
  profileHeader: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  username: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#ddd',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  postsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },
  postTypeSection: {
    marginBottom: 24,
  },
  postTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  postBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  postBadgeText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  postDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  postStats: {
    fontSize: 12,
    color: '#666',
  },
  postDate: {
    fontSize: 11,
    color: '#999',
  },
  playdateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  playdateInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  playdateLabel: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  playdateDetails: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  playdateDetailText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
    marginHorizontal: 20,
  },
  emailPrivate: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    padding: 6,
    borderRadius: 20,
  },
  profileInfoBox: {
  backgroundColor: '#fff',
  padding: 20,
  marginHorizontal: 16,
  marginTop: 20,
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
},

infoRow: {
  marginBottom: 16,
},

infoLabel: {
  fontSize: 16,
  color: '#777',
  marginBottom: 4,
  fontWeight: '500',
},

infoValue: {
  fontSize: 15,
  color: '#555',
  lineHeight: 20,
},

infoDivider: {
  height: 1,
  backgroundColor: '#eee',
  marginTop: 12,
},

editButton: {
  alignSelf: "flex-end",
  backgroundColor: "#007AFF",
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 8,
  marginBottom: 12,
},
editButtonText: {
  color: "#fff",
  fontWeight: "600",
},

inputField: {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 8,
  fontSize: 16,
  backgroundColor: "#fafafa",
  color: "#333",
  marginTop: 4,
},
});