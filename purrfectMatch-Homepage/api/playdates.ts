import { api } from "./Client";
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  orderBy, 
  Timestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';

export type PlaydateCreateDTO = {
  author_id: number;
  title: string;
  description: string;
  dog_breed: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  when_at: string;
  place: string;
  image_url?: string | null;
};

// Add a comment to a playdate post
export async function addComment(postId: number, content: string) {
  const { data } = await api.post("/comments", { postId, content });
  return data;
}

// Fetch comments for a specific playdate post
export async function getComments(postId: number) {
  const { data } = await api.get("/comments", { params: { postId } });
  return data as { items: { id: number; author_id: number; content: string; created_at: string }[] };
}

export async function createPlaydatePost(dto: PlaydateCreateDTO) {
  const { data } = await api.post("/playdates", dto);
  return data;
}

// Fetch a list of playdate posts with optional filters
export async function listPlaydates(params?: { city?: string; q?: string; page?: number; limit?: number }) {
  const { data } = await api.get("/playdates", { params });
  return data as { items: any[]; page: number; limit: number };
}

// ==================== FIREBASE FUNCTIONS (NEW) ====================

export interface PlaydatePostFirebase {
  id: string;
  authorId: string;
  username: string;
  title: string;
  description: string;
  dogBreed: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  whenAt: string;
  place: string;
  imageUrl?: string;
  createdAt: Date;
}

const COLLECTION = 'playdate_posts';

// Create playdate in Firebase
export async function createPlaydateFirebase(playdate: Omit<PlaydatePostFirebase, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...playdate,
      createdAt: Timestamp.now(),
    });
    console.log('Playdate created in Firebase with ID:', docRef.id);
    return { id: docRef.id, success: true };
  } catch (error) {
    console.error('Error creating playdate in Firebase:', error);
    throw error;
  }
}

// Get all playdates from Firebase
export async function listPlaydatesFirebase(): Promise<PlaydatePostFirebase[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const playdates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as PlaydatePostFirebase[];
    console.log(`Fetched ${playdates.length} playdates from Firebase`);
    return playdates;
  } catch (error) {
    console.error('Error fetching playdates from Firebase:', error);
    return [];
  }
}

// Get playdates by city from Firebase
export async function listPlaydatesByCityFirebase(city: string): Promise<PlaydatePostFirebase[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('city', '==', city),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const playdates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as PlaydatePostFirebase[];
    console.log(`Fetched ${playdates.length} playdates for city: ${city}`);
    return playdates;
  } catch (error) {
    console.error('Error fetching playdates by city from Firebase:', error);
    return [];
  }
}

// Delete playdate from Firebase
export async function deletePlaydateFirebase(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
    console.log('Playdate deleted from Firebase:', id);
    return { success: true };
  } catch (error) {
    console.error('Error deleting playdate from Firebase:', error);
    throw error;
  }
}