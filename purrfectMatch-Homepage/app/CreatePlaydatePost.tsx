import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { createPlaydatePost } from "./api/playdates";

export default function CreatePlaydatePost() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dogBreed, setDogBreed] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zip, setZip] = useState("");
  const [whenAt, setWhenAt] = useState(""); // e.g., "2025-11-01T10:00:00Z" or "Sat 2pm"
  const [place, setPlace] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    const required = [
      ["Title", title], ["Description", description], ["Dog breed", dogBreed],
      ["Address", address], ["City", city], ["State", stateVal],
      ["ZIP", zip], ["When", whenAt], ["Place", place],
    ];
    for (const [label, val] of required) {
      if (!String(val).trim()) return Alert.alert(`Missing ${label}`, `Please enter ${label.toLowerCase()}.`);
    }

    try {
      setSubmitting(true);
      await createPlaydatePost({
        author_id: 1, // TODO: replace with logged-in user later
        title: title.trim(),
        description: description.trim(),
        dog_breed: dogBreed.trim(),
        address: address.trim(),
        city: city.trim(),
        state: stateVal.trim(),
        zip: zip.trim(),
        when_at: whenAt.trim(),
        place: place.trim(),
        image_url: imageUrl.trim() ? imageUrl.trim() : null,
      });
      Alert.alert("Success", "Your playdate has been created.");
      router.back();
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? e?.message ?? "Failed to create playdate.";
      Alert.alert("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Playdate</Text>

      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Title" />
      <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} placeholder="Description" multiline />
      <TextInput style={styles.input} value={dogBreed} onChangeText={setDogBreed} placeholder="Dog breed" />
      <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Address" />
      <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="City" />
      <TextInput style={styles.input} value={stateVal} onChangeText={setStateVal} placeholder="State" autoCapitalize="characters" />
      <TextInput style={styles.input} value={zip} onChangeText={setZip} placeholder="ZIP" keyboardType="number-pad" />
      <TextInput style={styles.input} value={whenAt} onChangeText={setWhenAt} placeholder='When (e.g., "Sat 2pm" or ISO)' />
      <TextInput style={styles.input} value={place} onChangeText={setPlace} placeholder="Place" />
      <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} placeholder="Image URL (optional)" autoCapitalize="none" />

      <TouchableOpacity onPress={onSubmit} style={styles.submitButton} disabled={submitting}>
        {submitting ? <ActivityIndicator /> : <Text style={styles.submitText}>Post</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={{ color: "#fff" }}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, fontSize: 16 },
  multiline: { minHeight: 120, textAlignVertical: "top" },
  submitButton: { backgroundColor: "#007AFF", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 8 },
  submitText: { color: "#fff", fontWeight: "700" },
  backButton: { backgroundColor: "#888", paddingVertical: 10, borderRadius: 8, alignItems: "center", marginTop: 8 },
});