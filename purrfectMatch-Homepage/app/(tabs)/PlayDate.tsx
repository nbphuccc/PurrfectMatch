import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


// States that user can select to filter the location they want for the playdate
const US_STATES = [
'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];


// Placeholder for current example posts
const initialPosts = [
{
  id: 1,
  user: 'Anna',
  time: '3 min ago',
  title: 'Playdate at Green Lake!',
  city: 'Seattle',
  state: 'WA',
  image: 'https://images.unsplash.com/photo-1596496058854-5f9a75e6c36f?auto=format&fit=crop&w=800&q=80',
  description: "We’re hosting a playdate at Green Lake this Saturday, Oct...",
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
  image: 'https://images.unsplash.com/photo-1601758125946-6ec2f2d1dc3b?auto=format&fit=crop&w=800&q=80',
  description: 'Join us for a morning walk at Volunteer Park tomorrow!',
  likes: 15,
  comments: 2,
},
];


export default function PlaydateScreen() {
const [showForm, setShowForm] = useState(false);
const [formData, setFormData] = useState({
  time: '',
  date: '',
  petBreed: '',
  city: '',
  contactInfo: '',
  petImage: '',
  description: '',
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


const [posts, setPosts] = useState(initialPosts);
const [filteredPosts, setFilteredPosts] = useState(initialPosts);


const showAlert = (title: string, message: string) => {
  if (typeof window !== 'undefined' && window.alert) {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message, [{ text: 'OK' }]);
  }
};


// Update form fields and resert error state
const handleInputChange = (key: string, value: string) => {
  setFormData({ ...formData, [key]: value });
  if (errors[key as 'time' | 'date' | 'petBreed' | 'city']) {
    setErrors({ ...errors, [key]: false });
  }
};


// Validate the form to submit a new playdate post
const handleSubmit = () => {
  const trimmedTime = formData.time.trim();
  const trimmedDate = formData.date.trim();
  const trimmedBreed = formData.petBreed.trim();
  const trimmedCity = formData.city.trim();


  // Make sure required fields doesn't contain missing info
  const newErrors = {
    time: !trimmedTime,
    date: !trimmedDate,
    petBreed: !trimmedBreed,
    city: !trimmedCity,
  };


  if (newErrors.time || newErrors.date || newErrors.petBreed || newErrors.city) {
    setErrors(newErrors);
    showAlert('Missing Fields', 'Please fill out all required fields (Time, Date, Pet Breed, City, State) before posting.');
    return;
  }


  // Make sure user put in real time
  const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)(\s?[APap][Mm])?$/;
  if (!timeRegex.test(trimmedTime)) {
    setErrors({ ...newErrors, time: true });
    showAlert('Invalid Time', 'Please enter a valid time (e.g., 2:30 PM or 14:30).');
    return;
  }


  // Make sure user put in real date
  const dateObj = new Date(trimmedDate);
  if (isNaN(dateObj.getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
    setErrors({ ...newErrors, date: true });
    showAlert('Invalid Date', 'Please enter a valid date (YYYY-MM-DD).');
    return;
  }


  // Create new post object
  const newPost = {
    id: posts.length + 1,
    user: 'You',
    time: 'Just now',
    title: `Playdate with ${formData.petBreed}`,
    city: trimmedCity,
    state: selectedState,
    image: formData.petImage || 'https://via.placeholder.com/800x400.png?text=Pet+Image',
    description: formData.description.trim() || `${formData.petBreed} playdate scheduled!`,
    likes: 0,
    comments: 0,
  };


  // Update posts and filter post
  setPosts([newPost, ...posts]);
  setFilteredPosts([newPost, ...posts]);
  setShowForm(false);
  setFormData({ time: '', date: '', petBreed: '', city: '', contactInfo: '', petImage: '', description: '' });
  setErrors({ time: false, date: false, petBreed: false, city: false });


  showAlert('Success!', 'Your playdate form has been submitted successfully!');
};


// Filter playdate posts by city and state
const handleSearch = () => {
  if (!formData.city.trim()) {
    setFilteredPosts(posts);
    return;
  }
  const results = posts.filter(
    post =>
      post.city.toLowerCase() === formData.city.toLowerCase() &&
      post.state === selectedState
  );
  setFilteredPosts(results);
};


return (
  <View style={styles.container}>
    {!showForm && (
      <>
        <Text style={styles.header}>One Simple Post, One Fun Play Date!</Text>


        {/* Search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <TextInput
              placeholder="Enter city"
              style={styles.searchInput}
              value={formData.city}
              onChangeText={text => handleInputChange('city', text)}
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchIcon}>
              <Ionicons name="search" size={20} color="#888" />
            </TouchableOpacity>
          </View>


          {/* State picker for search */}
          <TouchableOpacity style={styles.dropdown} onPress={() => setModalVisible(true)}>
            <Text style={styles.dropdownText}>{selectedState} ▼</Text>
          </TouchableOpacity>
        </View>


        {/* Search dropdown modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <ScrollView>
                {US_STATES.map(state => (
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
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCancel}>
                <Text style={{ color: 'red', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


        {/* Feed */}
        <ScrollView style={styles.feed}>
          {filteredPosts.map(post => (
            <View key={post.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Image
                  source={{ uri: 'https://randomuser.me/api/portraits/women/68.jpg' }}
                  style={styles.profilePic}
                />
                <View>
                  <Text style={styles.username}>{post.user}</Text>
                  <Text style={styles.time}>{post.time}</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{post.title}</Text>
              <Image source={{ uri: post.image }} style={styles.cardImage} />
              <Text style={styles.description}>{post.description}</Text>
            </View>
          ))}
        </ScrollView>


        <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)}>
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      </>
    )}


    {/* Create Form */}
    {showForm && (
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.formTitle}>Create a Playdate</Text>


        <Text style={styles.label}>Time (required):</Text>
        <TextInput
          style={[styles.input, errors.time && styles.errorInput]}
          placeholder="e.g. 2:30 PM or 14:30"
          value={formData.time}
          onChangeText={text => handleInputChange('time', text)}
        />


        <Text style={styles.label}>Date (required):</Text>
        <TextInput
          style={[styles.input, errors.date && styles.errorInput]}
          placeholder="YYYY-MM-DD"
          value={formData.date}
          onChangeText={text => handleInputChange('date', text)}
        />


        <Text style={styles.label}>Pet Breed (required):</Text>
        <TextInput
          style={[styles.input, errors.petBreed && styles.errorInput]}
          placeholder="e.g. Golden Retriever"
          value={formData.petBreed}
          onChangeText={text => handleInputChange('petBreed', text)}
        />


        <Text style={styles.label}>City (required):</Text>
        <TextInput
          style={[styles.input, errors.city && styles.errorInput]}
          placeholder="Enter city"
          value={formData.city}
          onChangeText={text => handleInputChange('city', text)}
        />


        <Text style={styles.label}>State (required):</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setFormModalVisible(true)}>
          <Text style={styles.dropdownText}>{selectedState} ▼</Text>
        </TouchableOpacity>


        {/* Form dropdown modal */}
        <Modal visible={formModalVisible} transparent animationType="slide">
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <ScrollView>
                {US_STATES.map(state => (
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
              <TouchableOpacity onPress={() => setFormModalVisible(false)} style={styles.modalCancel}>
                <Text style={{ color: 'red', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


        <Text style={styles.label}>Contact Info (optional):</Text>
        <TextInput
          style={styles.input}
          placeholder="Your phone or email"
          value={formData.contactInfo}
          onChangeText={text => handleInputChange('contactInfo', text)}
        />


        <Text style={styles.label}>Pet Image URL (optional):</Text>
        <TextInput
          style={styles.input}
          placeholder="Image link"
          value={formData.petImage}
          onChangeText={text => handleInputChange('petImage', text)}
        />


        <Text style={styles.label}>Description (optional):</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          placeholder="Write something about your playdate..."
          value={formData.description}
          onChangeText={text => handleInputChange('description', text)}
          multiline
        />


        <TouchableOpacity style={[styles.button, { backgroundColor: '#F7D9C4' }]} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>


        <TouchableOpacity style={[styles.button, { backgroundColor: '#DDB398' }]} onPress={() => setShowForm(false)}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    )}
  </View>
);
}


// Stylesheet
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
 elevation: 3
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
cardTitle: { fontSize: 16,
 fontWeight: 'bold',
 marginVertical: 6
},
cardImage: {
 width: '100%',
 height: 200,
 borderRadius: 8
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



