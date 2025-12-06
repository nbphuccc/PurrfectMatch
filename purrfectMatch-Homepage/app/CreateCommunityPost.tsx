import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const PET_TYPES = ['Cat', 'Dog', 'Rabbit', 'Small Pet', 'Other'];
const CATEGORIES = ['Resource', 'Care', 'Other'];

type Props = {
  onSubmit: (dto: {
    petType?: string | null;
    category?: string | null;
    description: string;
    image?: string | null; // will be a local URI or null
  }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

export default function CreateCommunityPost({ onSubmit, onCancel, isSubmitting }: Props) {
  const [petModalVisible, setPetModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [petType, setPetType] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState(false);

  // local URI of photo picked from device
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  const showAlert = (title: string, message: string) => {
    if (typeof window !== 'undefined' && (window as any).alert) {
      (window as any).alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message, [{ text: 'OK' }]);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert(
        'Permission needed',
        'We need access to your photos so you can attach a picture.'
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

  const handleSubmit = () => {
    const trimmed = description.trim();
    if (!trimmed) {
      setDescriptionError(true);
      showAlert('Missing Description', 'Please provide a description for your post.');
      return;
    }

    onSubmit({
      petType: petType || null,
      category: category || null,
      description: trimmed,
      image: localImageUri || null, // pass local URI or null
    });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: 'bold',
          marginBottom: 20,
          textAlign: 'center',
        }}
      >
        Create a Community Post
      </Text>

      {/* Pet Type */}
      <Text style={{ fontSize: 16, marginTop: 10 }}>Pet Type:</Text>
      <TouchableOpacity
        style={{
          backgroundColor: '#f2f2f2',
          padding: 12,
          borderRadius: 8,
          marginTop: 5,
        }}
        onPress={() => setPetModalVisible(true)}
      >
        <Text style={{ color: '#333' }}>
          {petType || 'Select Pet Type ▼'}
        </Text>
      </TouchableOpacity>

      <Modal visible={petModalVisible} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              maxHeight: '70%',
              padding: 10,
            }}
          >
            <ScrollView>
              {PET_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    setPetType(type);
                    setPetModalVisible(false);
                  }}
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setPetModalVisible(false)}
              style={{ padding: 12, alignItems: 'center' }}
            >
              <Text style={{ color: 'red', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Category */}
      <Text style={{ fontSize: 16, marginTop: 10 }}>Category:</Text>
      <TouchableOpacity
        style={{
          backgroundColor: '#f2f2f2',
          padding: 12,
          borderRadius: 8,
          marginTop: 5,
        }}
        onPress={() => setCategoryModalVisible(true)}
      >
        <Text style={{ color: '#333' }}>
          {category || 'Select Category ▼'}
        </Text>
      </TouchableOpacity>

      <Modal visible={categoryModalVisible} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              maxHeight: '70%',
              padding: 10,
            }}
          >
            <ScrollView>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    setCategory(cat);
                    setCategoryModalVisible(false);
                  }}
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setCategoryModalVisible(false)}
              style={{ padding: 12, alignItems: 'center' }}
            >
              <Text style={{ color: 'red', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Photo upload from phone (no URL) */}
      <Text style={{ fontSize: 16, marginTop: 10 }}>Photo (optional):</Text>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          marginTop: 5,
          borderRadius: 8,
          backgroundColor: '#f2f2f2',
          alignItems: 'center',
        }}
        onPress={handlePickImage}
      >
        <Text style={{ fontWeight: '600', color: '#333' }}>
          {localImageUri ? 'Change Photo' : 'Upload Photo from Phone'}
        </Text>
      </TouchableOpacity>

      {localImageUri && (
        <Image
          source={{ uri: localImageUri }}
          style={{
            marginTop: 10,
            width: '100%',
            height: 200,
            borderRadius: 8,
            backgroundColor: '#f5f5f5',
          }}
        />
      )}

      {/* Description */}
      <Text style={{ fontSize: 16, marginTop: 10 }}>Description:</Text>
      <TextInput
        style={[
          {
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            marginTop: 5,
            borderRadius: 8,
            backgroundColor: '#fff',
            height: 100,
            textAlignVertical: 'top',
          },
          descriptionError && { borderColor: '#FF6B6B' },
        ]}
        placeholder="Write your post..."
        value={description}
        onChangeText={(text) => {
          setDescription(text);
          setDescriptionError(false);
        }}
        multiline
      />

      {/* Buttons */}
      <TouchableOpacity
        style={[
          {
            padding: 12,
            borderRadius: 10,
            alignItems: 'center',
            marginTop: 16,
            backgroundColor: '#F7D9C4',
          },
          isSubmitting && { opacity: 0.6 },
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={{ fontWeight: 'bold', color: '#000' }}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          padding: 12,
          borderRadius: 10,
          alignItems: 'center',
          marginTop: 16,
          backgroundColor: '#DDB398',
        }}
        onPress={onCancel}
        disabled={isSubmitting}
      >
        <Text style={{ fontWeight: 'bold', color: '#000' }}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
