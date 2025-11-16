import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { api, abs } from '../../api/Client';
import { createCommunityPost, listCommunity } from '../../api/community';
import CreateCommunityPost from '../CreateCommunityPost';


const PET_TYPES = ['Cat', 'Dog', 'Rabbit', 'Small Pet', 'Other'];
const CATEGORIES = ['Resource', 'Care', 'Other'];


type Post = {
  id: number;
  user: string;
  created_at?: string; // ISO timestamp from server or optimistic client
  petType: string;
  category: string;
  description: string;
  image?: string;
  liked?: boolean;
  likes: number;
  comments: number;
};

const initialPosts: Post[] = [
  {
    id: 1,
    user: 'Lily',
    created_at: '2025-11-07T06:00:00.000Z',
    petType: 'Cat',
    category: 'Care',
    description: 'Tips on grooming for long-haired cats!',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80',
    likes: 8,
    comments: 2,
  },
  {
    id: 2,
    user: 'Tom',
    created_at: '2025-11-06T09:00:00.000Z',
    petType: 'Rabbit',
    category: 'Resource',
    description: 'Looking for a good vet for small pets near Portland!',
    image: 'https://vetsonbalwyn.com.au/wp-content/uploads/2015/04/Rabbit-Facts.jpg',
    likes: 5,
    comments: 1,
  },
];


type FormData = {
  petType: string;
  category: string;
  description: string;
  image: string;
};

export default function CommunityScreen() {
  const [showForm, setShowForm] = useState(false);
  // start empty and load from server on mount
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchPetType, setSearchPetType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { width } = useWindowDimensions();

  // Format server-created timestamps into short relative strings.
  const formatRelativeTime = (iso: string) => {
    const t = Date.parse(iso);
    if (Number.isNaN(t)) return iso;
    const diff = Date.now() - t;
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (diff < minute) {
      return 'now';
    }
    if (diff < hour) {
      return `${Math.floor(diff / minute)}m`;
    }
    if (diff < day) {
      return `${Math.floor(diff / hour)}h`;
    }
    if (diff < 30 * day) {
      return `${Math.floor(diff / day)}d`;
    }
    const d = new Date(t);
    return `${d.getMonth() + 1}.${d.getDate()}.${d.getFullYear()}`;
  };

  const formatTimeValue = (v?: string | null) => {
    if (!v) return '';
    const parsed = Date.parse(v);
    if (Number.isNaN(parsed)) return v;
    return formatRelativeTime(v);
  };

  // tick to force re-render so relative times update as real time passes
  const [, setTick] = useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30 * 1000); // every 30s
    return () => clearInterval(id);
  }, []);

  // Load community posts from backend on mount
  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await listCommunity();
        if (!mounted) return;
        setPosts(res.items);
        setFilteredPosts(res.items);
      } catch (err: any) {
        console.error('Failed to load community posts', err);
        if (mounted) setLoadError(err?.message || 'Failed to load community posts');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);


  const showAlert = (title: string, message: string) => {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message, [{ text: 'OK' }]);
    }
  };


  const handleCreateFromComponent = async (dto: { petType?: string | null; category?: string | null; description: string; image?: string | null }) => {
    if (isSubmitting) return;
    const trimmedDesc = dto.description.trim();

    if (!trimmedDesc) {
      showAlert('Missing Description', 'Please provide a description for your post.');
      return;
    }

    setIsSubmitting(true);

    const petType = dto.petType || 'All Pets';
    const category = dto.category || 'Other';
    const image = dto.image ? dto.image : undefined;

    // Build client DTO (UI-friendly) and let createCommunityPost map to server shape
    const clientDto = { petType, category, description: trimmedDesc, image: image ?? null };
    let saved: any = null;
    try {
      const res = await createCommunityPost(clientDto);
      saved = res;
    } catch (e) {
      saved = null;
    }

    if (saved && saved.id) {
      // refresh feed from server to get canonical data
      try {
        const res = await listCommunity();
        setPosts(res.items);
        setFilteredPosts(res.items);
        setShowForm(false);
        showAlert('Success!', 'Your community post has been submitted!');
      } catch (err) {
        // server created the post but we couldn't reload the feed
        showAlert('Success', 'Your post was created but the feed could not be refreshed.');
      }
    } else {
      showAlert('Submission failed', 'Could not send post to server. Please try again later.');
    }

    setIsSubmitting(false);
  };



  const handleSearch = (petType: string) => {
    if (!petType.trim()) {
      setFilteredPosts(posts);
      return;
    }
    const results = posts.filter(
      post => post.petType.toLowerCase() === petType.toLowerCase()
    );
    setFilteredPosts(results);
  };


  // Compute a consistent numeric card width so every post has the same width.
  // We subtract horizontal margins (32) so cards fit inside the padded container.
  const cardWidth = Math.max(300, Math.min(width - 32, 800));
  const router = useRouter();

  const toggleLike = (postId: number) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? Math.max(0, p.likes - 1) : p.likes + 1 }
          : p
      )
    );
    setFilteredPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? Math.max(0, p.likes - 1) : p.likes + 1 }
          : p
      )
    );
  };


  return (
    <View style={styles.container}>
      {!showForm && (
        <>
          <Text style={styles.header}>Share, Ask, and Help Other Pet Owners!</Text>
          {loading && (
            <Text style={{ textAlign: 'center', marginTop: 8 }}>Loading posts...</Text>
          )}
          {loadError && (
            <Text style={{ textAlign: 'center', marginTop: 8, color: 'red' }}>{loadError}</Text>
          )}


          {/* Search bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <TextInput
                placeholder="Search by pet type (e.g. Cat)"
                placeholderTextColor="#888"
                style={styles.searchInput}
                value={searchPetType}
                onChangeText={text => setSearchPetType(text)}
              />
              <TouchableOpacity onPress={() => handleSearch(searchPetType)} style={styles.searchIcon}>
                <Ionicons name="search" size={20} color="#888" />
              </TouchableOpacity>
            </View>
          </View>


          {/* Feed */}
          <ScrollView style={styles.feed} contentContainerStyle={{ alignItems: 'center' }}>
            {filteredPosts.map(post => (
              <TouchableOpacity
                key={post.id}
                activeOpacity={0.8}
                onPress={() => {
                  // navigate to the post detail route and pass fields as params
                  router.push({
                    pathname: '../communityPost',
                    params: {
                      id: String(post.id),
                      user: post.user,
                      time: post.created_at ?? '',
                      petType: post.petType,
                      category: post.category,
                      description: post.description,
                      image: post.image,
                      likes: post.likes,
                      comments: post.comments
                    },
                  });
                }}
              >
                <View style={[styles.card, { width: cardWidth }]}>
                  <View style={styles.cardHeader}>
                    <Image
                      source={{ uri: 'https://media.istockphoto.com/id/1444657782/vector/dog-and-cat-profile-logo-design.jpg?s=612x612&w=0&k=20&c=86ln0k0egBt3EIaf2jnubn96BtMu6sXJEp4AvaP0FJ0=' }}
                      style={styles.profilePic}
                    />

                    <View>
                      <Text style={styles.username}>{post.user}</Text>
                      <Text style={styles.time}>{formatTimeValue(post.created_at)}</Text>
                    </View>
                  </View>

                  <Text style={styles.description} numberOfLines={3}>{post.description}</Text>
                  {post.image ? (
                    <View style={styles.cardImageContainer}>
                      <Image source={{ uri: post.image }} style={styles.cardImage} />
                    </View>
                  ) : null}

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                    <TouchableOpacity
                      style={{ marginRight: 16, flexDirection: 'row', alignItems: 'center' }}
                      onPress={() => toggleLike(post.id)}
                    >
                      <Ionicons
                        name={post.liked ? 'heart' : 'heart-outline'}
                        size={20}
                        color={post.liked ? '#e0245e' : '#000'}
                      />
                      <Text style={{ marginLeft: 8 }}>{post.likes}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ marginRight: 16, flexDirection: 'row', alignItems: 'center' }}
                      onPress={() => {
                        router.push({
                          pathname: '../communityPost',
                          params: {
                            id: String(post.id),
                            user: post.user,
                            time: post.created_at ?? '',
                            petType: post.petType,
                            category: post.category,
                            description: post.description,
                            image: post.image,
                            likes: post.likes,
                            comments: post.comments
                          },
                        });
                      }}
                    >
                      <Ionicons name="chatbubble-outline" size={20} />
                      <Text style={{ marginLeft: 8 }}>{post.comments}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)}>
            <Ionicons name="add" size={32} color="white" />
          </TouchableOpacity>
        </>
      )}


      {showForm && (
        <CreateCommunityPost
          onSubmit={handleCreateFromComponent}
          onCancel={() => setShowForm(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    color: '#000'
  },
  searchContainer: {
    flexDirection: 'row',
    margin: 16,
    alignItems: 'center'
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 8
  },
  searchInput: {
    flex: 1,
    paddingVertical: 6
  },
  searchIcon: {
    padding: 6
  },
  dropdown: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 5,
    borderRadius: 8
  },
  dropdownText: {
    color: '#333'
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '70%',
    padding: 10
  },
  modalItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalItemText: {
    fontSize: 16
  },
  modalCancel: {
    padding: 12,
    alignItems: 'center'
  },
  feed: {
    flex: 1,
    paddingHorizontal: 16
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10
  },
  username: {
    fontWeight: '600',
    fontSize: 15
  },
  time: {
    color: '#666',
    fontSize: 12
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
    marginTop: 0,
  },
  cardImageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 6,
    backgroundColor: 'transparent',
  },
  description: {
    color: '#444',
    marginTop: 8
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#3B82F6',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  formContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  label: {
    fontSize: 16,
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 5,
    borderRadius: 8,
    backgroundColor: '#fff'
  },
  errorInput: {
    borderColor: '#FF6B6B'
  },
  button: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#000'
  },
});