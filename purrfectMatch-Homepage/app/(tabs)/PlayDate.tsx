import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  KeyboardAvoidingView, 
  Platform, 
} from 'react-native';
import { addComment, getComments, createPlaydatePost, listPlaydates, createPlaydateFirebase, listPlaydatesFirebase } from "../../api/playdates";
import CreateComments from "../CreateComments";

/**
 * PlaydateScreen
 *
 * Responsibilities:
 * - Load the list of playdate posts from the backend (GET /playdates) on mount
 * - Provide a small search/filter UI (client-side) for city + state
 * - Show a form for creating a new playdate which POSTs to the backend
 * - When a playdate is successfully created, refresh the feed from the server
 */

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const initialPosts = [
  {
    id: 1,
    user: 'Anna',
    time: '3 min ago',
    title: 'Playdate at Green Lake!',
    city: 'Seattle',
    state: 'WA',
    image:
      'https://paradepets.com/.image/w_3840,q_auto:good,c_limit/NTowMDAwMDAwMDAwMDMzNDg5/shutterstock_246276190_1200x800.jpg',
    description: "We're hosting a playdate at Green Lake this Saturday!",
    whenAt: 'Saturday 2:00 PM',
    likes: 21,
    comments: 4,
  },
  {
    id: 2,
    user: 'Daniel',
    time: '2 hrs ago',
    title: 'Morning walk meetup',
    city: 'Portland',
    state: 'OR',
    image:
      'https://cdn.britannica.com/84/232784-050-1769B477/Siberian-Husky-dog.jpg',
    description: 'Join us for a morning walk at Volunteer Park tomorrow!',
    whenAt: 'Saturday 2:00 PM',
    likes: 15,
    comments: 2,
  },
];

export default function PlaydateScreen() {
  const { postId } = useLocalSearchParams();
  const postIdNum = Array.isArray(postId) ? Number(postId[0]) : Number(postId);
  const hasValidPostId = postId !== undefined && !Number.isNaN(postIdNum);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    time: '',
    date: '',
    petBreed: '',
    city: '',
    contactInfo: '',
    petImage: '',
    description: '',
    address: '',
    zip: '',
  });
  const [errors, setErrors] = useState({
    time: false,
    date: false,
    petBreed: false,
    city: false,
  });
  const [selectedState, setSelectedState] = useState('WA');
  const [modalVisible, setModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [posts, setPosts] = useState<typeof initialPosts>([]);
  const [filteredPosts, setFilteredPosts] = useState<typeof initialPosts>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const dynamicCardWidth =
    width > 900 ? 800 : width > 600 ? 550 : '100%';

  const showAlert = (title: string, message: string) => {
    if (typeof window !== 'undefined' && window.alert)
      window.alert(`${title}\n\n${message}`);
    else Alert.alert(title, message, [{ text: 'OK' }]);
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
    if (errors[key as 'time' | 'date' | 'petBreed' | 'city']) {
      setErrors({ ...errors, [key]: false });
    }
  };

  // --- Form submission flow ---
  // Validates required fields locally, then POSTs to the backend via
  // `createPlaydatePost`. On success we clear the form and re-load the
  // canonical feed with `listPlaydates()` so UI matches the server.

  const handleSubmit = async () => {
    const trimmedTime = formData.time.trim();
    const trimmedDate = formData.date.trim();
    const trimmedBreed = formData.petBreed.trim();
    const trimmedCity = formData.city.trim();
  
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const isDateValid = dateRegex.test(trimmedDate);
  
    const newErrors = {
      time: !trimmedTime,
      date: !isDateValid,
      petBreed: !trimmedBreed,
      city: !trimmedCity,
    };
  
    if (
      newErrors.time ||
      newErrors.date ||
      newErrors.petBreed ||
      newErrors.city
    ) {
      setErrors(newErrors);
      showAlert(
        'Invalid or Missing Fields',
        !isDateValid
          ? 'Please enter a valid date in the format YYYY-MM-DD.'
          : 'Please fill out all required fields.'
      );
      return;
    }
    const whenAt = `${trimmedDate} ${trimmedTime}`;
    try {
      setLoading(true);
      console.log('About to create playdate in Firebase...');
      
      // USE FIREBASE INSTEAD OF SERVER
      await createPlaydateFirebase({
        authorId: 1,
        username: 'Guest',
        title: `Playdate with ${trimmedBreed}`,
        description: formData.description.trim() || `${trimmedBreed} playdate scheduled!`,
        dogBreed: trimmedBreed,
        address: formData.address?.trim() || 'TBD',
        city: trimmedCity,
        state: selectedState,
        zip: formData.zip?.trim() || '98055',
        whenAt: whenAt,
        place: trimmedCity,
        imageUrl: formData.petImage?.trim() || '',
      });
      console.log('Playdate created! Refreshing feed...');
      setShowForm(false);
      setFormData({
        time: '',
        date: '',
        petBreed: '',
        city: '',
        contactInfo: '',
        petImage: '',
        description: '',
        address: '',
        zip: '',
      });
      // REFRESH FROM FIREBASE
      try {
        const firebasePosts = await listPlaydatesFirebase();
        const formattedPosts = firebasePosts.map((post, index) => ({
          id: index + 1,
          user: post.username,
          time: new Date(post.createdAt).toLocaleString(),
          title: post.title,
          city: post.city,
          state: post.state,
          image: post.imageUrl || '',
          description: post.description,
          whenAt: post.whenAt,
          likes: 0,
          comments: 0,
        }));
        setPosts(formattedPosts);
        setFilteredPosts(formattedPosts);
        showAlert('Success!', 'Your playdate has been posted to Firebase!');
      } catch (err) {
        console.error('Failed to reload playdates from Firebase', err);
        showAlert('Success!', 'Your playdate was submitted but the feed could not be refreshed.');
      }
    } catch (error) {
      console.error('Failed to create playdate in Firebase:', error);
      Alert.alert('Error', 'Failed to create playdate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!formData.city.trim()) {
      setFilteredPosts(posts);
      return;
    }
    const results = posts.filter(
      (post) =>
        post.city.toLowerCase() === formData.city.toLowerCase() &&
        post.state === selectedState
    );
    setFilteredPosts(results);
  };

  // --- Data loading ---
  // On mount, fetch playdates from the backend and populate `posts` and
  // `filteredPosts`. We keep a `mounted` flag to avoid setting state if the
  // component unmounts while the fetch is in-flight.

  // load playdates from backend on mount
  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        //LOAD FROM FIREBASE
        const firebasePosts = await listPlaydatesFirebase();
        if (!mounted) return;
        
        const formattedPosts = firebasePosts.map((post, index) => ({
          id: index + 1,
          user: post.username,
          time: new Date(post.createdAt).toLocaleString(),
          title: post.title,
          city: post.city,
          state: post.state,
          image: post.imageUrl || '',
          description: post.description,
          whenAt: post.whenAt,
          likes: 0,
          comments: 0,
        }));
        
        setPosts(formattedPosts);
        setFilteredPosts(formattedPosts);
      } catch (err: any) {
        console.error('Failed to load playdates from Firebase', err);
        setLoadError(err?.message || 'Failed to load playdates');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (hasValidPostId) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: 'bold',
            marginBottom: 8,
          }}
        >
          Playdate Details
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
    <View style={styles.container}>
      {!showForm && (
        <>
          <Text style={styles.header}>
            One Simple Post, One Fun Play Date!
          </Text>
          {loading && (
            <Text style={{ textAlign: 'center', marginTop: 8 }}>Loading feed...</Text>
          )}
          {loadError && (
            <Text style={{ textAlign: 'center', marginTop: 8, color: 'red' }}>{loadError}</Text>
          )}

          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <TextInput
                placeholder="Enter city"
                style={styles.searchInput}
                value={formData.city}
                onChangeText={(text) =>
                  handleInputChange('city', text)
                }
              />
              <TouchableOpacity
                onPress={handleSearch}
                style={styles.searchIcon}
              >
                <Ionicons name="search" size={20} color="#888" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.dropdownText}>{selectedState} ▼</Text>
            </TouchableOpacity>
          </View>

          <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.modalBackground}>
              <View style={styles.modalContent}>
                <ScrollView>
                  {US_STATES.map((state) => (
                    <TouchableOpacity
                      key={state}
                      onPress={() => {
                        setSelectedState(state);
                        setModalVisible(false);
                      }}
                      style={styles.modalItem}
                    >
                      <Text style={styles.modalItemText}>{state}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCancel}
                >
                  <Text
                    style={{
                      color: 'red',
                      fontWeight: 'bold',
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <ScrollView
            style={styles.feed}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            {filteredPosts.map((post) => (
              <View
                key={post.id}
                style={[styles.card, { width: dynamicCardWidth }]}
              >
                <View style={styles.cardHeader}>
                  <Image
                    source={{
                      uri: 'https://media.istockphoto.com/id/1444657782/vector/dog-and-cat-profile-logo-design.jpg',
                    }}
                    style={styles.profilePic}
                  />
                  <View>
                    <Text style={styles.username}>{post.user}</Text>
                    <Text style={styles.time}>{post.time}</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>{post.title}</Text>
                <Text style={styles.location}>{post.city}, {post.state}</Text>
                {post.whenAt && (<Text style={styles.whenAt}>{post.whenAt}</Text>)}
                <Text
                  style={[
                    styles.description,
                    !post.image && { marginBottom: 6 },
                  ]}
                >
                  {post.description}
                </Text>
                {post.image ? (
                  <Image
                    source={{ uri: post.image }}
                    style={styles.cardImage}
                  />
                ) : null}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowForm(true)}
          >
            <Ionicons name="add" size={32} color="white" />
          </TouchableOpacity>
        </>
      )}

      {showForm && (
        <ScrollView
        contentContainerStyle={styles.formContainer}
        keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.formTitle}>Create a Playdate</Text>

          <Text style={styles.label}>Time (required):</Text>
          <TextInput
            style={[styles.input, errors.time && styles.errorInput]}
            placeholder="e.g. 2:30 PM"
            value={formData.time}
            onChangeText={(text) => handleInputChange('time', text)}
          />

          <Text style={styles.label}>Date (required):</Text>
          <TextInput
            style={[styles.input, errors.date && styles.errorInput]}
            placeholder="YYYY-MM-DD"
            value={formData.date}
            onChangeText={(text) => handleInputChange('date', text)}
          />

          <Text style={styles.label}>Pet Breed (required):</Text>
          <TextInput
            style={[styles.input, errors.petBreed && styles.errorInput]}
            placeholder="e.g. Golden Retriever"
            value={formData.petBreed}
            onChangeText={(text) =>
              handleInputChange('petBreed', text)
            }
          />

          <Text style={styles.label}>City (required):</Text>
          <TextInput
            style={[styles.input, errors.city && styles.errorInput]}
            placeholder="Enter city"
            value={formData.city}
            onChangeText={(text) => handleInputChange('city', text)}
          />

          <Text style={styles.label}>State (required):</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setFormModalVisible(true)}
          >
            <Text style={styles.dropdownText}>{selectedState} ▼</Text>
          </TouchableOpacity>

          <Modal visible={formModalVisible} transparent animationType="slide">
            <View style={styles.modalBackground}>
              <View style={styles.modalContent}>
                <ScrollView>
                  {US_STATES.map((state) => (
                    <TouchableOpacity
                      key={state}
                      onPress={() => {
                        setSelectedState(state);
                        setFormModalVisible(false);
                      }}
                      style={styles.modalItem}
                    >
                      <Text style={styles.modalItemText}>{state}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  onPress={() => setFormModalVisible(false)}
                  style={styles.modalCancel}
                >
                  <Text
                    style={{
                      color: 'red',
                      fontWeight: 'bold',
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Text style={styles.label}>Contact Info (optional):</Text>
          <TextInput
            style={styles.input}
            placeholder="Your phone or email"
            value={formData.contactInfo}
            onChangeText={(text) =>
              handleInputChange('contactInfo', text)
            }
          />

          <Text style={styles.label}>Pet Image URL (optional):</Text>
          <TextInput
            style={styles.input}
            placeholder="Image link"
            value={formData.petImage}
            onChangeText={(text) => handleInputChange('petImage', text)}
          />

          <Text style={styles.label}>Description (optional):</Text>
          <TextInput
            style={[
              styles.input,
              { height: 100, textAlignVertical: 'top' },
            ]}
            placeholder="Write something about your playdate..."
            value={formData.description}
            onChangeText={(text) =>
              handleInputChange('description', text)
            }
            multiline
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#F7D9C4' }]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#DDB398' }]}
            onPress={() => setShowForm(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      </View>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    margin: 16,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  searchInput: { flex: 1, paddingVertical: 6 },
  searchIcon: { padding: 6 },
  dropdown: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 5,
    borderRadius: 8,
  },
  dropdownText: { color: '#333' },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '70%',
    padding: 10,
  },
  modalItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: { fontSize: 16 },
  modalCancel: { padding: 12, alignItems: 'center' },
  feed: { flex: 1, paddingHorizontal: 16 },
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
    marginBottom: 8,
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: '#e0e0e0', // Gray background
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: { fontWeight: '600', fontSize: 15 },
  time: { color: '#666', fontSize: 12 },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 6,
    lineHeight: 20,
    textAlign: 'left',
  },
  location: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  cardImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 4 / 3,
    borderRadius: 8,
    resizeMode: 'cover',
    marginTop: 6,
  },
  whenAt: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    color: '#444',
    marginTop: 8,
    lineHeight: 20,
    textAlign: 'left',
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
    shadowRadius: 4,
  },
  formContainer: { flexGrow: 1, paddingBottom: 120, padding: 20 },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: { fontSize: 16, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 5,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  errorInput: { borderColor: '#FF6B6B' },
  button: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { fontWeight: 'bold', color: '#000' },
});