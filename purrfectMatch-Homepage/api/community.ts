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
  doc,
  updateDoc,
  increment,
  deleteDoc
} from 'firebase/firestore';

// Client-side create DTO: includes UI fields petType and category.
export type CommunityCreateDTO = {
  petType?: string | null;
  category?: string | null;
  description: string;
  image?: string | null;
};

// ==================== OLD SERVER API (keep for now) ====================

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

export async function createCommunityPost(dto: CommunityCreateDTO) {
  const serverDto = {
    author_id: 1, //HERE
    title: `${dto.category ?? 'Other'} - ${dto.petType ?? 'All Pets'}`,
    description: dto.description,
    image_url: dto.image ?? null,
  };

  const { data } = await api.post("/community", serverDto);
  return data;
}

export async function listCommunity(params?: { q?: string; page?: number; limit?: number }) {
  const { data } = await api.get("/community", { params });
  return data as { items: any[]; page: number; limit: number };
}

// ==================== FIREBASE FUNCTIONS ====================

export interface CommunityPostFirebase {
  authorId: string;
  username: string;
  petType: string;
  category: string;
  description: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: Date;
}

export async function createCommunityPostFirebase(post: {
  authorId: string;
  username: string;
  petType: string;
  category: string;
  description: string;
  imageUrl?: string;
}) {
  try {
    const communityRef = collection(db, 'community_posts');
    const docRef = await addDoc(communityRef, {
      authorId: post.authorId,
      username: post.username,
      petType: post.petType,
      category: post.category,
      description: post.description,
      imageUrl: post.imageUrl || null,
      likes: 0,
      comments: 0,
      createdAt: Timestamp.now(),
    });
    console.log('Community post created in Firebase with ID:', docRef.id);
    return { id: docRef.id, success: true };
  } catch (error) {
    console.error('Error creating community post in Firebase:', error);
    throw error;
  }
}

export async function listCommunityPostsFirebase(params?: { 
  petType?: string; 
  category?: string;
  searchQuery?: string;
}): Promise<(CommunityPostFirebase & { id: string })[]> {
  try {
    const communityRef = collection(db, 'community_posts');
    let q = query(communityRef, orderBy('createdAt', 'desc'));

    if (params?.petType) {
      q = query(communityRef, where('petType', '==', params.petType), orderBy('createdAt', 'desc'));
    }

    if (params?.category) {
      q = query(communityRef, where('category', '==', params.category), orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    let posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      likes: doc.data().likes || 0,
      comments: doc.data().comments || 0,
      createdAt: doc.data().createdAt.toDate(),
    })) as (CommunityPostFirebase & { id: string })[];

    if (params?.searchQuery) {
      const searchLower = params.searchQuery.toLowerCase();
      posts = posts.filter(post => 
        post.description.toLowerCase().includes(searchLower) ||
        post.petType.toLowerCase().includes(searchLower) ||
        post.category.toLowerCase().includes(searchLower)
      );
    }

    console.log(`Fetched ${posts.length} community posts from Firebase`);
    return posts;
  } catch (error) {
    console.error('Error fetching community posts from Firebase:', error);
    return [];
  }
}

// ==================== COMMENTS (FIREBASE) ====================

export interface CommentFirebase {
  postId: string;
  authorId: string;
  username: string;
  content: string;
  createdAt: Date;
}

export async function getCommentsFirebase(postId: string): Promise<(CommentFirebase & { id: string })[]> {
  try {
    const commentsRef = collection(db, 'community_comments');
    const q = query(
      commentsRef,
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const comments = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        postId: data.postId,
        authorId: data.authorId,
        username: data.username,
        content: data.content,
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(), // ⭐ Fallback
      };
    }) as (CommentFirebase & { id: string })[];
    
    console.log(`Fetched ${comments.length} comments from Firebase`);
    return comments;
  } catch (error) {
    console.error('Error fetching comments from Firebase:', error);
    return [];
  }
}

export async function addCommentFirebase(comment: {
  postId: string;
  authorId: string;
  username: string;
  content: string;
}) {
  try {
    const commentsRef = collection(db, 'community_comments');
    const postRef = doc(db, 'community_posts', comment.postId);
    
    // Add comment
    await addDoc(commentsRef, {
      postId: comment.postId,
      authorId: comment.authorId,
      username: comment.username,
      content: comment.content,
      createdAt: Timestamp.now(),
    });
    
    // Increment comment count on post
    await updateDoc(postRef, {
      comments: increment(1),
    });
    
    console.log('Comment added to Firebase');
    return { success: true };
  } catch (error) {
    console.error('Error adding comment to Firebase:', error);
    throw error;
  }
}

// ==================== LIKES (FIREBASE) ====================

export async function toggleLikeFirebase(postId: string, userId: string) {
  try {
    const postRef = doc(db, 'community_posts', postId);
    const likesRef = collection(db, 'community_likes');
    
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
    const likesRef = collection(db, 'community_likes');
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