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
  deleteDoc,
  writeBatch,
  getDoc,
  arrayUnion,
} from 'firebase/firestore';

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

export async function deleteCommunityPostFirebase(postId: string) {
  if (!postId) throw new Error('postId is required');
    const batch = writeBatch(db);
  try {
    // 1. Delete the post itself
    const postRef = doc(db, 'community_posts', postId);
    batch.delete(postRef);

    // 2. Delete all likes for this post
    const likesQuery = query(collection(db, 'community_likes'), where('postId', '==', postId));
    const likesSnapshot = await getDocs(likesQuery);
    likesSnapshot.forEach((docSnap) => batch.delete(docSnap.ref));

    // 3. Delete all comments for this post
    const commentsQuery = query(collection(db, 'community_comments'), where('postId', '==', postId));
    const commentsSnapshot = await getDocs(commentsQuery);
    commentsSnapshot.forEach((docSnap) => batch.delete(docSnap.ref));

    // Commit batch
    await batch.commit();
    console.log(`Post ${postId} and all its likes/comments deleted successfully.`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete community post:', error);
    throw error;
  }
}

// ==================== COMMENTS (FIREBASE) ====================

export interface CommentFirebase {
  id: string
  postId: string;
  authorId: string;
  username: string;
  content: string;
  createdAt: Date;
  edits?: string[];
}

export async function getCommentsFirebase(postId: string): Promise<CommentFirebase[]> {
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
        edits: data.edits ?? [],
      };
    });
    
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

export async function deleteCommunityCommentFirebase(commentId: string, postId: string): Promise<{ success: boolean }> {
  try {
    // Delete the comment
    const commentRef = doc(db, "community_comments", commentId);
    await deleteDoc(commentRef);

    console.log(`Comment ${commentId} deleted successfully`);

    // Decrement the comments count on the post
    if (postId) {
      const postRef = doc(db, "community_posts", postId);
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

export const editCommunityCommentFirebase = async (commentId: string,newContent: string): Promise<{ success: boolean}> => {
  try {
    const commentRef = doc(db, "community_comments", commentId);
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