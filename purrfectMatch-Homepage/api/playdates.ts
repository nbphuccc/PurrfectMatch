import { api } from "./Client";
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";

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


export async function addComment(postId: number, content: string) {
  const { data } = await api.post("/comments", { postId, content });
  return data;
}

export async function getComments(postId: number) {
  const { data } = await api.get("/comments", { params: { postId } });
  return data as {
    items: { id: number; author_id: number; content: string; created_at: string }[];
  };
}

export async function createPlaydatePost(dto: PlaydateCreateDTO) {
  const { data } = await api.post("/playdates", dto);
  return data;
}

export async function listPlaydates(params?: {
  city?: string;
  q?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get("/playdates", { params });
  return data as { items: any[]; page: number; limit: number };
}

// ==================== FIREBASE PLAYDATES ====================

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
  likes?: number;
  comments?: number;
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

const COLLECTION = "playdate_posts";

export async function createPlaydateFirebase(
  playdate: Omit<PlaydatePostFirebase, "id" | "createdAt">
) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...playdate,
      createdAt: Timestamp.now(),
      likes: 0,
      comments: 0,
    });
    console.log("Playdate created in Firebase with ID:", docRef.id);
    return { id: docRef.id, success: true };
  } catch (error) {
    console.error("Error creating playdate in Firebase:", error);
    throw error;
  }
}

export async function listPlaydatesFirebase(): Promise<PlaydatePostFirebase[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const playdates = snapshot.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate() ?? new Date(),
        likes: data.likes ?? 0,
        comments: data.comments ?? 0,
      } as PlaydatePostFirebase;
    });
    console.log(`Fetched ${playdates.length} playdates from Firebase`);
    return playdates;
  } catch (error) {
    console.error("Error fetching playdates from Firebase:", error);
    return [];
  }
}

export async function listPlaydatesByCityFirebase(
  city: string
): Promise<PlaydatePostFirebase[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("city", "==", city),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const playdates = snapshot.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate() ?? new Date(),
        likes: data.likes ?? 0,
        comments: data.comments ?? 0,
      } as PlaydatePostFirebase;
    });
    console.log(`Fetched ${playdates.length} playdates for city: ${city}`);
    return playdates;
  } catch (error) {
    console.error("Error fetching playdates by city from Firebase:", error);
    return [];
  }
}

export async function deletePlaydateFirebase(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
    console.log("Playdate deleted from Firebase:", id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting playdate from Firebase:", error);
    throw error;
  }
}

// ==================== FIREBASE COMMENTS (NO INDEX NEEDED) ====================

export interface PlaydateCommentFirebase {
  postId: string;
  authorId: string;
  username: string;
  content: string;
  createdAt: Date;
}

export async function addPlaydateCommentFirebase(comment: {
  postId: string;
  authorId: string;
  username: string;
  content: string;
}) {
  try {
    const commentsRef = collection(db, "playdate_comments");

    // Add comment document
    await addDoc(commentsRef, {
      postId: comment.postId,
      authorId: comment.authorId,
      username: comment.username,
      content: comment.content,
      createdAt: Timestamp.now(),
    });

    // Increment comment count on the playdate post
    const postRef = doc(db, COLLECTION, comment.postId);
    await updateDoc(postRef, {
      comments: increment(1),
    });

    console.log("Playdate comment added");
    return { success: true };
  } catch (error) {
    console.error("Error adding playdate comment:", error);
    throw error;
  }
}

export async function getPlaydateCommentsFirebase(
  postId: string
): Promise<(PlaydateCommentFirebase & { id: string })[]> {
  try {
    const commentsRef = collection(db, "playdate_comments");

    // No orderBy → no composite index required
    const q = query(commentsRef, where("postId", "==", postId));
    const snapshot = await getDocs(q);

    const comments = snapshot.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        postId: data.postId,
        authorId: data.authorId,
        username: data.username,
        content: data.content,
        createdAt: data.createdAt?.toDate() ?? new Date(),
      } as PlaydateCommentFirebase & { id: string };
    });

    // Sort newest first on the client
    comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return comments;
  } catch (error) {
    console.error("Error fetching playdate comments:", error);
    return [];
  }
}
