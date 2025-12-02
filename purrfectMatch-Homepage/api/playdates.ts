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
  writeBatch,
  getDoc,
  arrayUnion,
} from "firebase/firestore";

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
  likes: number;
  comments: number;
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

export async function deletePlaydatePostFirebase(postId: string) {
  if (!postId) throw new Error('postId is required');
    const batch = writeBatch(db);
  try {
    // 1. Delete the playdate post itself
    const postRef = doc(db, 'playdate_posts', postId);
    batch.delete(postRef);

    // 2. Delete all likes for this post
    const likesQuery = query(collection(db, 'playdate_likes'), where('postId', '==', postId));
    const likesSnapshot = await getDocs(likesQuery);
    likesSnapshot.forEach((docSnap) => batch.delete(docSnap.ref));

    // 3. Delete all comments for this post
    const commentsQuery = query(collection(db, 'playdate_comments'), where('postId', '==', postId));
    const commentsSnapshot = await getDocs(commentsQuery);
    commentsSnapshot.forEach((docSnap) => batch.delete(docSnap.ref));

    // Commit batch
    await batch.commit();
    console.log(`Playdate post ${postId} and all its likes/comments deleted successfully.`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete playdate post:', error);
    throw error;
  }
}

export const editPlaydatePostFirebase = async (postId: string, newDescription: string): Promise<{ success: boolean}> => {
  try {
    const postRef = doc(db, "playdate_posts", postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return { success: false };
    }

    const oldDescription = postSnap.data().description;

    // Update the post description: save previous description in edits array
    await updateDoc(postRef, {
      description: newDescription,
      edits: arrayUnion(oldDescription),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to edit post:", error);
    return { success: false };
  }
}

// ==================== FIREBASE COMMENTS (NO INDEX NEEDED) ====================

export interface PlaydateCommentFirebase {
  postId: string;
  authorId: string;
  username: string;
  content: string;
  createdAt: Date;
  edits?: string[];
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
        edits: data.edits ?? [],
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

export async function deletePlaydateCommentFirebase(commentId: string, postId: string): Promise<{ success: boolean }> {
  try {
    // Delete the comment
    const commentRef = doc(db, "playdate_comments", commentId);
    await deleteDoc(commentRef);

    console.log(`Comment ${commentId} deleted successfully`);

    // Decrement the comments count on the post
    if (postId) {
      const postRef = doc(db, "playdate_posts", postId);
      await updateDoc(postRef, {
        comments: increment(-1),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return { success: false };
  }
}

export const editPlaydateCommentFirebase = async (commentId: string,newContent: string): Promise<{ success: boolean}> => {
  try {
    const commentRef = doc(db, "playdate_comments", commentId);
    const commentSnap = await getDoc(commentRef);

    if (!commentSnap.exists()) {
      return { success: false };
    }

    const oldContent = commentSnap.data().content;

    // Update the comment: save previous content in edits array
    await updateDoc(commentRef, {
      content: newContent,
      edits: arrayUnion(oldContent),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to edit comment:", error);
    return { success: false };
  }
}

// ==================== LIKES (FIREBASE) ====================

export async function toggleLikeFirebase(postId: string, userId: string) {
  try {
    const postRef = doc(db, 'playdate_posts', postId);
    const likesRef = collection(db, 'playdate_likes');
    
    // Check if user already liked this post
    const likeQuery = query(
      likesRef,
      where('postId', '==', postId),
      where('userId', '==', userId)
    );
    const likeSnapshot = await getDocs(likeQuery);
    
    if (likeSnapshot.empty) {
      // Add like
      await addDoc(likesRef, {
        postId,
        userId,
        createdAt: Timestamp.now(),
      });
      await updateDoc(postRef, {
        likes: increment(1),
      });
      console.log('Like added to Firebase');
      return { liked: true };
    } else {
      // Remove like
      const likeDoc = likeSnapshot.docs[0];
      await deleteDoc(likeDoc.ref);
      await updateDoc(postRef, {
        likes: increment(-1),
      });
      console.log('Like removed from Firebase');
      return { liked: false };
    }
  } catch (error) {
    console.error('Error toggling like in Firebase:', error);
    throw error;
  }
}

export async function getLikeStatusFirebase(postId: string, userId: string): Promise<boolean> {
  try {
    const likesRef = collection(db, 'playdate_likes');
    const likeQuery = query(
      likesRef,
      where('postId', '==', postId),
      where('userId', '==', userId)
    );
    const likeSnapshot = await getDocs(likeQuery);
    return !likeSnapshot.empty;
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
}
