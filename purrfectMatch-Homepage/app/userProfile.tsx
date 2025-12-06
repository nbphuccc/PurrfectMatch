import React, {useState, useCallback} from "react";
import { 
  StyleSheet, ScrollView, View, Text, Image, ActivityIndicator, TouchableOpacity 
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {getUserProfileFirebase, ProfileFirebase, } from '../api/firebaseAuth';
import { CommunityPostFirebase, listCommunityPostsFirebase } from '../api/community';
import { PlaydatePostFirebase, listPlaydatesFirebase } from '../api/playdates';
import { useFocusEffect } from '@react-navigation/native';

export default function UserProfile() {
  const params = useLocalSearchParams();
    const authorId = Array.isArray(params.authorId)
    ? params.authorId[0]
    : params.authorId ?? "";

  const [profile, setProfile] = useState<ProfileFirebase | null>(null);
  const [userPosts, setUserPosts] = useState<(CommunityPostFirebase & { id: string; type: 'community' })[]>([]);
  const [userPlaydates, setUserPlaydates] = useState<PlaydatePostFirebase[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  
  const router = useRouter();

  const loadUserPosts = useCallback(async (userId: string) => {
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
    useCallback(() => {
        console.log("Screen focused, refreshing author's posts & profile...");

        if (authorId) {
        // 1. Load posts
        loadUserPosts(authorId);

        // 2. Load profile
        const fetchProfile = async () => {
            try {
            const profile = await getUserProfileFirebase(authorId);
            setProfile(profile);
            } catch (err) {
            console.error("Failed to fetch profile:", err);
            setProfile(null);
            }
        };

        fetchProfile();
        }
    }, [authorId, loadUserPosts])
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="always">
      {loadingPosts && (
        <View style={styles.fullScreenLoading}>
          <Image
            source={{
              uri: 'https://media.istockphoto.com/id/1444657782/vector/dog-and-cat-profile-logo-design.jpg?s=612x612&w=0&k=20&c=86ln0k0egBt3EIaf2jnubn96BtMu6sXJEp4AvaP0FJ0=',
            }}
            style={styles.loadingImage}
          />
          <ActivityIndicator size="large" color="#3498db" style={styles.loadingSpinner} />
        </View>
      )}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
            <Image
              source={{ uri: profile?.avatar }}
              style={styles.profilePic}
            />
        </View>

        <Text style={styles.username}>{profile?.username}</Text>
        {profile?.publicEmail && (
            <Text style={styles.email}>{profile.email}</Text>
        )}
        
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
      </View>

      <View style={styles.profileInfoBox}>
        {/* Name */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>

          
            <Text style={styles.infoValue}>
              {profile?.name ? profile.name : "Not set"}
            </Text>
          
          <View style={styles.infoDivider} />
        </View>

        {/* Email */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>

          
            <Text style={styles.infoValue}>
              {profile?.publicEmail ? "Public" : "Private"}
            </Text>
          

          <View style={styles.infoDivider} />
        </View>

        {/* Bio */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bio</Text>

          
            <Text style={styles.infoValue}>
              {profile?.bio ? profile.bio : "Not set"}
            </Text>
        </View>

        
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
                {userPosts.length > 0 && (
                  <View style={styles.postTypeSection}>
                    <Text style={styles.postTypeTitle}>
                      Community Posts ({userPosts.length})
                    </Text>
                    {userPosts.map((post) => (
                      <TouchableOpacity
                        key={post.id}
                        activeOpacity={0.8}
                        onPress={() => {
                          router.push({
                            pathname: '../communityPost',
                            params: {
                              id: post.id
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
                              id: playdate.id
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
                            <Text style={styles.playdateDetailText}>{playdate.city}</Text>
                          </View>
                          {playdate.imageUrl && (
                            <Image source={{ uri: playdate.imageUrl }} style={styles.postImage} />
                          )}
                          <View style={styles.postFooter}>
                            <Text style={styles.postStats}>{playdate.likes} likes</Text>
                            <Text style={styles.postStats}>{playdate.comments} comments</Text>
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
fullScreenLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff', // or semi-transparent like 'rgba(255,255,255,0.9)'
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // ensure it sits on top
  },
  loadingImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  loadingSpinner: {
    marginTop: 10,
  },
});
