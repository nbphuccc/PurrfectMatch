import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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
} from 'react-native';


const PET_TYPES = ['Cat', 'Dog', 'Rabbit', 'Small Pet', 'Other'];
const CATEGORIES = ['Resource', 'Care', 'Other'];


const initialPosts = [
 {
   id: 1,
   user: 'Lily',
   time: '2 hrs ago',
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
   time: '1 day ago',
   petType: 'Rabbit',
   category: 'Resource',
   description: 'Looking for a good vet for small pets near Portland!',
   image: 'https://images.unsplash.com/photo-1558944351-cd0e597c6f82?auto=format&fit=crop&w=800&q=80',
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
 const [formData, setFormData] = useState({
   petType: '',
   category: '',
   description: '',
   image: '',
 });
 const [errors, setErrors] = useState({
   description: false,
 });
 const [posts, setPosts] = useState(initialPosts);
 const [filteredPosts, setFilteredPosts] = useState(initialPosts);
 const [petModalVisible, setPetModalVisible] = useState(false);
 const [categoryModalVisible, setCategoryModalVisible] = useState(false);
 const { width } = useWindowDimensions(); // dynamically track screen width


 const showAlert = (title: string, message: string) => {
   if (typeof window !== 'undefined' && window.alert) {
     window.alert(`${title}\n\n${message}`);
   } else {
     Alert.alert(title, message, [{ text: 'OK' }]);
   }
 };


 const handleInputChange = (key: string, value: string) => {
   setFormData({ ...formData, [key]: value });
   if (errors[key as 'description']) {
     setErrors({ ...errors, [key]: false });
   }
 };


 const handleSubmit = () => {
   const trimmedDesc = formData.description.trim();


   if (!trimmedDesc) {
     setErrors({ ...errors, description: true });
     showAlert('Missing Description', 'Please provide a description for your post.');
     return;
   }


   const newPost = {
     id: posts.length + 1,
     user: 'You',
     time: 'Just now',
     petType: formData.petType || 'All Pets',
     category: formData.category || 'Other',
     description: trimmedDesc,
     image: formData.image || 'https://via.placeholder.com/800x400.png?text=Community+Post',
     likes: 0,
     comments: 0,
   };


   setPosts([newPost, ...posts]);
   setFilteredPosts([newPost, ...posts]);
   setShowForm(false);
   setFormData({ petType: '', category: '', description: '', image: '' });
   showAlert('Success!', 'Your community post has been submitted!');
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


 // Dynamically compute max width for web screens
 const dynamicCardWidth = width > 900 ? 800 : width > 600 ? 550 : '100%';


 return (
   <View style={styles.container}>
     {!showForm && (
       <>
         <Text style={styles.header}>Share, Ask, and Help Other Pet Owners!</Text>


         {/* Search bar */}
         <View style={styles.searchContainer}>
           <View style={styles.searchBox}>
             <TextInput
               placeholder="Search by pet type (e.g. Cat)"
               style={styles.searchInput}
               value={formData.petType}
               onChangeText={text => handleInputChange('petType', text)}
             />
             <TouchableOpacity onPress={() => handleSearch(formData.petType)} style={styles.searchIcon}>
               <Ionicons name="search" size={20} color="#888" />
             </TouchableOpacity>
           </View>
         </View>


         {/* Feed */}
         <ScrollView style={styles.feed} contentContainerStyle={{ alignItems: 'center' }}>
           {filteredPosts.map(post => (
             <View key={post.id} style={[styles.card, { width: dynamicCardWidth }]}>
               <View style={styles.cardHeader}>
                 <Image
                   source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                   style={styles.profilePic}
                 />
                 <View>
                   <Text style={styles.username}>{post.user}</Text>
                   <Text style={styles.time}>{post.time}</Text>
                 </View>
               </View>
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


     {showForm && (
       <ScrollView contentContainerStyle={styles.formContainer}>
         <Text style={styles.formTitle}>Create a Community Post</Text>


         <Text style={styles.label}>Pet Type:</Text>
         <TouchableOpacity style={styles.dropdown} onPress={() => setPetModalVisible(true)}>
           <Text style={styles.dropdownText}>{formData.petType || 'Select Pet Type ▼'}</Text>
         </TouchableOpacity>


         <Modal visible={petModalVisible} transparent animationType="slide">
           <View style={styles.modalBackground}>
             <View style={styles.modalContent}>
               <ScrollView>
                 {PET_TYPES.map(type => (
                   <TouchableOpacity
                     key={type}
                     onPress={() => {
                       handleInputChange('petType', type);
                       setPetModalVisible(false);
                     }}
                     style={styles.modalItem}
                   >
                     <Text style={styles.modalItemText}>{type}</Text>
                   </TouchableOpacity>
                 ))}
               </ScrollView>
               <TouchableOpacity onPress={() => setPetModalVisible(false)} style={styles.modalCancel}>
                 <Text style={{ color: 'red', fontWeight: 'bold' }}>Cancel</Text>
               </TouchableOpacity>
             </View>
           </View>
         </Modal>


         <Text style={styles.label}>Category:</Text>
         <TouchableOpacity style={styles.dropdown} onPress={() => setCategoryModalVisible(true)}>
           <Text style={styles.dropdownText}>{formData.category || 'Select Category ▼'}</Text>
         </TouchableOpacity>


         <Modal visible={categoryModalVisible} transparent animationType="slide">
           <View style={styles.modalBackground}>
             <View style={styles.modalContent}>
               <ScrollView>
                 {CATEGORIES.map(cat => (
                   <TouchableOpacity
                     key={cat}
                     onPress={() => {
                       handleInputChange('category', cat);
                       setCategoryModalVisible(false);
                     }}
                     style={styles.modalItem}
                   >
                     <Text style={styles.modalItemText}>{cat}</Text>
                   </TouchableOpacity>
                 ))}
               </ScrollView>
               <TouchableOpacity onPress={() => setCategoryModalVisible(false)} style={styles.modalCancel}>
                 <Text style={{ color: 'red', fontWeight: 'bold' }}>Cancel</Text>
               </TouchableOpacity>
             </View>
           </View>
         </Modal>


         <Text style={styles.label}>Photo URL (optional):</Text>
         <TextInput
           style={styles.input}
           placeholder="Paste image link"
           value={formData.image}
           onChangeText={text => handleInputChange('image', text)}
         />


         <Text style={styles.label}>Description (required):</Text>
         <TextInput
           style={[styles.input, { height: 100, textAlignVertical: 'top' }, errors.description && styles.errorInput]}
           placeholder="Write your post..."
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


const styles = StyleSheet.create({
 container: { flex: 1, backgroundColor: '#fff' },
 header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginTop: 40, color: '#000' },
 searchContainer: { flexDirection: 'row', margin: 16, alignItems: 'center' },
 searchBox: { flex: 1, flexDirection: 'row', backgroundColor: '#f2f2f2', alignItems: 'center', paddingHorizontal: 10, borderRadius: 8 },
 searchInput: { flex: 1, paddingVertical: 6 },
 searchIcon: { padding: 6 },
 dropdown: { backgroundColor: '#f2f2f2', paddingHorizontal: 12, paddingVertical: 10, marginTop: 5, borderRadius: 8 },
 dropdownText: { color: '#333' },
 modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 20 },
 modalContent: { backgroundColor: '#fff', borderRadius: 12, maxHeight: '70%', padding: 10 },
 modalItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
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
 cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
 profilePic: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
 username: { fontWeight: '600', fontSize: 15 },
 time: { color: '#666', fontSize: 12 },
 cardImage: {
   width: '100%',
   height: undefined,
   aspectRatio: 4 / 3,
   borderRadius: 8,
   resizeMode: 'cover',
   objectFit: 'cover',
   marginTop: 6,
 },
 description: { color: '#444', marginTop: 8 },
 fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#3B82F6', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4 },
 formContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
 formTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
 label: { fontSize: 16, marginTop: 10 },
 input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginTop: 5, borderRadius: 8, backgroundColor: '#fff' },
 errorInput: { borderColor: '#FF6B6B' },
 button: { padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
 buttonText: { fontWeight: 'bold', color: '#000' },
});



