import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
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
} from "react-native";
import {createPlaydateFirebase, listPlaydatesFirebase, toggleLikeFirebase, getLikeStatusFirebase } from "../../api/playdates";
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../../config/firebase";
import { getCurrentUser, getUserProfileFirebase } from "../../api/firebaseAuth";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

type CardPost = {
  id: string;
  authorId: string     
  user: string;
  avatar: string;
  time: string;
  title: string;
  city: string;
  state: string;
  image: string | null;
  description: string;
  whenAt: string;
  likes: number;
  comments: number;
  liked: boolean;
  address?: string | null;
  zip?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string | null;
};

async function uploadImageToStorage(uri: string): Promise<string> {
  const storage = getStorage(app);
  const response = await fetch(uri);
  const blob = await response.blob();

  const filename = `playdates/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.jpg`;
  const storageRef = ref(storage, filename);

  await uploadBytes(storageRef, blob);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

type SelectedLocation = {
  latitude: number;
  longitude: number;
};

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function PlaydateScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [showForm, setShowForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    time: "",
    date: "",
    petBreed: "",
    city: "",
    contactInfo: "",
    petImage: "",
    description: "",
    address: "",
    zip: "",
  });

  const [errors, setErrors] = React.useState({
    time: false,
    date: false,
    petBreed: false,
    city: false,
  });

  const [selectedState, setSelectedState] = React.useState("WA");
  const [modalVisible, setModalVisible] = React.useState(false);
  const [formModalVisible, setFormModalVisible] = React.useState(false);
  const [posts, setPosts] = React.useState<CardPost[]>([]);
  const [filteredPosts, setFilteredPosts] = React.useState<CardPost[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [localImageUri, setLocalImageUri] = React.useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [locationQuery, setLocationQuery] = React.useState('');
  const [selectedLocation, setSelectedLocation] = React.useState<SelectedLocation | null>(null);

  const dynamicCardWidth = width > 900 ? 800 : width > 600 ? 550 : "100%";

  const [, setTick] = useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30 * 1000);
    return () => clearInterval(id);
  }, []);

  const showAlert = (title: string, message: string) => {
    if (typeof window !== "undefined" && (window as any).alert)
      (window as any).alert(`${title}\n\n${message}`);
    else Alert.alert(title, message, [{ text: "OK" }]);
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key as "time" | "date" | "petBreed" | "city"]) {
      setErrors((prev) => ({ ...prev, [key]: false }));
    }
  };

  const geocodeLocation = async () => {
    const query = locationQuery.trim();
    if (!query) {
      showAlert('Location required', 'Please type a park name or address first.');
      return;
    }
  
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Missing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY');
      showAlert('Config error', 'Map lookup is not configured yet.');
      return;
    }
  
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        query
      )}&key=${GOOGLE_MAPS_API_KEY}`;
  
      const res = await fetch(url);
      const data = await res.json();
  
      if (data.status !== 'OK' || !data.results.length) {
        showAlert('Not found', 'Could not find that location. Try a more specific address.');
        return;
      }
  
      const result = data.results[0];
      const { lat, lng } = result.geometry.location;
  
      setSelectedLocation({
        latitude: lat,
        longitude: lng,
      });
  
      // Optional: overwrite address with the formatted address returned by Google
      setFormData(prev => ({
        ...prev,
        address: result.formatted_address,
      }));
    } catch (err) {
      console.error('Geocoding failed:', err);
      showAlert('Error', 'Failed to look up that location. Please try again.');
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showAlert(
        "Permission needed",
        "We need access to your photo library to upload a picture."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setLocalImageUri(asset.uri);
    }
  };

  const toggleLike = async (postId: string) => {
    const currentUser = getCurrentUser();
      if (!currentUser) {
        Alert.alert('Not Logged In', 'Please log in to like posts.');
        return;
      }
  
      try {
        // Optimistic update
        const updatePosts = (prev: CardPost[]) =>
          prev.map(p =>
            p.id === postId
              ? { ...p, liked: !p.liked, likes: p.liked ? Math.max(0, p.likes - 1) : p.likes + 1 }
              : p
          );
  
        setPosts(updatePosts);
        setFilteredPosts(updatePosts);
  
        // Update Firebase
        await toggleLikeFirebase(postId, currentUser.uid);
        
        // Reload to sync with Firebase
        await loadPlaydates();
      } catch (error) {
        console.error('Error toggling like:', error);
        Alert.alert('Error', 'Failed to update like. Please try again.');
        // Revert optimistic update
        await loadPlaydates();
      }
    };

  const handleSubmit = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      Alert.alert("Not Logged In", "Please log in to post.");
      return;
    }

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
        "Invalid or Missing Fields",
        !isDateValid
          ? "Please enter a valid date in the format YYYY-MM-DD."
          : "Please fill out all required fields."
      );
      return;
    }

    const whenAt = `${trimmedDate} ${trimmedTime}`;

    try {
      setLoading(true);

      let finalImageUrl = "";
      if (localImageUri) {
        try {
          setUploadingImage(true);
          finalImageUrl = await uploadImageToStorage(localImageUri);
        } finally {
          setUploadingImage(false);
        }
      }

      await createPlaydateFirebase({
        authorId: currentUser.uid,
        username: currentUser.displayName || "User",
        title: `Playdate with ${trimmedBreed}`,
        description:
          formData.description.trim() || `${trimmedBreed} playdate scheduled!`,
        dogBreed: trimmedBreed,
        address: formData.address?.trim() || "TBD",
        city: trimmedCity,
        state: selectedState,
        zip: formData.zip?.trim() || "98055",
        whenAt: whenAt,
        place: trimmedCity,
        imageUrl: finalImageUrl,
        likes: 0,
        comments: 0,
        locationName:
          locationQuery.trim() ||
          formData.address?.trim() ||
          trimmedCity,
        latitude: selectedLocation?.latitude ?? null,
        longitude: selectedLocation?.longitude ?? null,
      });

      // Reset form
      setShowForm(false);
      setFormData({
        time: "",
        date: "",
        petBreed: "",
        city: "",
        contactInfo: "",
        petImage: "",
        description: "",
        address: "",
        zip: "",
      });
      setLocationQuery('');
      setSelectedLocation(null);
      setLocalImageUri(null);

      await loadPlaydates();

      showAlert("Success!", "Your playdate has been posted!");
    } catch (error) {
      console.error("Failed to create playdate:", error);
      Alert.alert("Error", "Failed to create playdate.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const city = formData.city.trim().toLowerCase();

    console.log("Searching for city:", city, "and state:", selectedState);

    const results = posts.filter((post) => {
      const matchesState = post.state === selectedState;
      const matchesCity = city ? post.city.toLowerCase() === city : true; // if no city, auto-true

      return matchesCity && matchesState;
    });

    setFilteredPosts(results);
  };

  const loadPlaydates = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const firebasePosts = await listPlaydatesFirebase();
      const currentUser = getCurrentUser();

      const formattedPosts: CardPost[] = await Promise.all(
        firebasePosts.map(async (post) => {
          // Check if current user liked this post
          const liked = currentUser ? await getLikeStatusFirebase(post.id, currentUser.uid) : false;
          const profile = await getUserProfileFirebase(post.authorId);
          return {
            id: post.id,
            authorId: post.authorId,
            user: post.username,
            avatar: profile?.avatar || "",
            time: post.createdAt.toLocaleString(),
            title: post.title,
            city: post.city,
            state: post.state,
            image: post.imageUrl || "",
            description: post.description,
            whenAt: post.whenAt,
            likes: post.likes ?? 0,
            comments: post.comments ?? 0,
            liked: liked,
            address: post.address,
            zip: post.zip,
            latitude: post.latitude ?? null,
            longitude: post.longitude ?? null,
            locationName: post.locationName ?? null,
          };
        })
      );

      setPosts(formattedPosts);
      setFilteredPosts(formattedPosts);
    } catch (err: any) {
      setLoadError(err?.message || "Failed to load playdates");
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  React.useEffect(() => {
    if (currentUser) {
      loadPlaydates();
    }
  }, [currentUser, loadPlaydates]);
  */

  useFocusEffect(
      React.useCallback(() => {
        console.log('Screen focused, refreshing playdates ...');
        loadPlaydates();
      }, [loadPlaydates])
    );

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
              <Text style={{ textAlign: "center", marginTop: 8 }}>
                Loading feed...
              </Text>
            )}
            {loadError && (
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 8,
                  color: "red",
                }}
              >
                {loadError}
              </Text>
            )}

            <View style={styles.searchContainer}>
              <View style={styles.searchBox}>
                <TextInput
                  placeholder="Enter city"
                  style={styles.searchInput}
                  value={formData.city}
                  onChangeText={(text) => handleInputChange("city", text)}
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
                    <Text style={{ color: "red", fontWeight: "bold" }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <ScrollView
              style={styles.feed}
              contentContainerStyle={{ alignItems: "center" }}
            >
              {filteredPosts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={[styles.card, { width: dynamicCardWidth }]}
                  onPress={() =>
                    router.push({
                      pathname: "/playdatePost",
                      params: {
                        id: post.id,
                        authorId: post.authorId,
                        title: post.title,
                        user: post.user,
                        time: post.time,
                        description: post.description,
                        location: `${post.city}, ${post.state}`,
                        date: post.whenAt,
                        image: post.image ? encodeURIComponent(post.image) : "",
                        address: post.address ?? "",
                        city: post.city,
                        state: post.state,
                        zip: post.zip ?? "",
                      },
                    })
                  }
                >
                  <View style={styles.cardHeader}>
                    <Image
                      source={{
                        uri: post.avatar || 'https://media.istockphoto.com/id/1444657782/vector/dog-and-cat-profile-logo-design.jpg?s=612x612&w=0&k=20&c=86ln0k0egBt3EIaf2jnubn96BtMu6sXJEp4AvaP0FJ0=',
                      }}
                      style={styles.profilePic}
                    />
                    <View>
                      <Text style={styles.username}>{post.user}</Text>
                      <Text style={styles.time}>{post.time}</Text>
                    </View>
                  </View>

                  <Text style={styles.cardTitle}>{post.title}</Text>
                  <Text style={styles.location}>
                    {post.city}, {post.state}
                  </Text>

                  {post.whenAt && (
                    <Text style={styles.whenAt}>{post.whenAt}</Text>
                  )}

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

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 10,
                      gap: 14,
                    }}
                  >
                    {/* Like */}
                    <TouchableOpacity
                      onPress={() => toggleLike(post.id)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Ionicons
                        name={post.liked ? "heart" : "heart-outline"}
                        size={20}
                        color={post.liked ? "red" : "#444"}
                      />
                      <Text>{post.likes}</Text>
                    </TouchableOpacity>

                    {/* Comment Count */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Ionicons
                        name="chatbubble-outline"
                        size={20}
                        color="#444"
                      />
                      <Text>{post.comments ?? 0}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
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
              onChangeText={(text) => handleInputChange("time", text)}
            />

            <Text style={styles.label}>Date (required):</Text>
            <TextInput
              style={[styles.input, errors.date && styles.errorInput]}
              placeholder="YYYY-MM-DD"
              value={formData.date}
              onChangeText={(text) => handleInputChange("date", text)}
            />

            <Text style={styles.label}>Pet Breed (required):</Text>
            <TextInput
              style={[styles.input, errors.petBreed && styles.errorInput]}
              placeholder="e.g. Golden Retriever"
              value={formData.petBreed}
              onChangeText={(text) => handleInputChange("petBreed", text)}
            />

            <Text style={styles.label}>City (required):</Text>
            <TextInput
              style={[styles.input, errors.city && styles.errorInput]}
              placeholder="Enter city"
              value={formData.city}
              onChangeText={(text) => handleInputChange("city", text)}
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
                    <Text style={{ color: "red", fontWeight: "bold" }}>
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
              onChangeText={(text) => handleInputChange("contactInfo", text)}
            />

            <Text style={styles.label}>Pet Photo (optional):</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePickImage}
            >
              <Text style={styles.uploadButtonText}>
                {localImageUri ? "Change Photo" : "Upload Photo"}
              </Text>
            </TouchableOpacity>

            {localImageUri && (
              <Image source={{ uri: localImageUri }} style={styles.previewImage} />
            )}

            <Text style={styles.label}>Description (optional):</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              placeholder="Write something about your playdate..."
              value={formData.description}
              onChangeText={(text) => handleInputChange("description", text)}
              multiline
            />
                      <Text style={styles.label}>Playdate Location (optional):</Text>
          <TextInput
            style={styles.input}
            placeholder="Type park name or address"
            value={locationQuery}
            onChangeText={setLocationQuery}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#E5F0FF', marginTop: 8 }]}
            onPress={geocodeLocation}
          >
            <Text style={styles.buttonText}>Find on Map</Text>
          </TouchableOpacity>

          {selectedLocation && (
            <View
              style={{
                marginTop: 10,
                borderRadius: 8,
                overflow: 'hidden',
                height: 200,
              }}
            >
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                region={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker coordinate={selectedLocation} />
              </MapView>
            </View>
          )}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#F7D9C4" }]}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#DDB398" }]}
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
  uploadButton: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  uploadButtonText: {
    fontWeight: "600",
    color: "#333",
  },
  previewImage: {
    marginTop: 10,
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 40,
    color: "#000",
  },
  searchContainer: {
    flexDirection: "row",
    margin: 16,
    alignItems: "center",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  searchInput: { flex: 1, paddingVertical: 6 },
  searchIcon: { padding: 6 },
  dropdown: {
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 5,
    borderRadius: 8,
  },
  dropdownText: { color: "#333" },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    maxHeight: "70%",
    padding: 10,
  },
  modalItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalItemText: { fontSize: 16 },
  modalCancel: { padding: 12, alignItems: "center" },
  feed: { flex: 1, paddingHorizontal: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  username: { fontWeight: "600", fontSize: 15 },
  time: { color: "#666", fontSize: 12 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 6,
    lineHeight: 20,
    textAlign: "left",
  },
  location: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    marginBottom: 8,
  },
  cardImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 4 / 3,
    borderRadius: 8,
    resizeMode: "cover",
    marginTop: 6,
  },
  whenAt: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    color: "#444",
    marginTop: 8,
    lineHeight: 20,
    textAlign: "left",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#3B82F6",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  formContainer: { flexGrow: 1, paddingBottom: 120, padding: 20 },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: { fontSize: 16, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginTop: 5,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  errorInput: { borderColor: "#FF6B6B" },
  button: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { fontWeight: "bold", color: "#000" },
});
