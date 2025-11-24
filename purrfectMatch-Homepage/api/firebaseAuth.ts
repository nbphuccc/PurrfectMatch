import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";

interface SignupData {
  email: string;
  username: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  ok: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signupFirebase({ email, username, password }: SignupData): Promise<AuthResponse> {
  try {
    // Validate inputs
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return {
        ok: false,
        message: 'Please enter a valid email address (e.g., user@example.com)'
      };
    }

    if (password.length < 6) {
      return {
        ok: false,
        message: 'Password must be at least 6 characters'
      };
    }

    if (!trimmedUsername) {
      return {
        ok: false,
        message: 'Username is required'
      };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
    
    await updateProfile(userCredential.user, {
      displayName: trimmedUsername,
    });

    await setUserProfileFirebase(userCredential.user.uid, {
      email: userCredential.user.email!,
      username: trimmedUsername,
      name: "",
      bio: "",
      avatar: 'https://media.istockphoto.com/id/1444657782/vector/dog-and-cat-profile-logo-design.jpg?s=612x612&w=0&k=20&c=86ln0k0egBt3EIaf2jnubn96BtMu6sXJEp4AvaP0FJ0=',
      publicEmail: false,
    });

    console.log('Firebase signup successful:', userCredential.user.email);

    return {
      ok: true,
      user: {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        username: trimmedUsername,
      }
    };
  } catch (error: any) {
    console.error('Firebase signup error:', error.code, error.message);
    
    let message = 'Signup failed';
    if (error.code === 'auth/email-already-in-use') {
      message = 'This email is already registered. Try logging in instead.';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password should be at least 6 characters';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Please enter a valid email address';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Network error. Check your internet connection.';
    }
    
    return {
      ok: false,
      message: message
    };
  }
}

export async function loginFirebase({ email, password }: LoginData): Promise<AuthResponse> {
  try {
    // Validate inputs
    const trimmedEmail = email.trim();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return {
        ok: false,
        message: 'Please enter a valid email address (e.g., user@example.com)'
      };
    }

    if (!password) {
      return {
        ok: false,
        message: 'Password is required'
      };
    }

    const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
    
    console.log('Firebase login successful:', userCredential.user.email);
    
    return {
      ok: true,
      user: {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        username: userCredential.user.displayName || 'User',
      }
    };
  } catch (error: any) {
    console.error('Firebase login error:', error.code, error.message);
    
    let message = 'Login failed';
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      message = 'Invalid email or password';
    } else if (error.code === 'auth/user-not-found') {
      message = 'No account found with this email. Please sign up.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Please enter a valid email address';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Too many failed attempts. Try again later.';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Network error. Check your internet connection.';
    }
    
    return {
      ok: false,
      message: message
    };
  }
}

export async function logoutFirebase() {
  try {
    await signOut(auth);
    console.log('Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export interface ProfileFirebase {
    id: string;
    email: string;
    username: string;
    name: string;
    bio: string;
    avatar: string;
    publicEmail: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

export async function setUserProfileFirebase(userId: string, profile: {
  email: string;
  username: string;
  name: string;
  bio: string;
  avatar: string;
  publicEmail: boolean;
}) {
  try {
    await setDoc(doc(db, "profile", userId), {
      ...profile,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log("User profile saved to Firebase");
    return { success: true };
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
}

export async function getUserProfileFirebase(userId: string) {
  try {
    const ref = doc(db, "profile", userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    const data = snap.data();

    return {
      id: snap.id,
      email: data.email,
      username: data.username,
      name: data.name,
      bio: data.bio,
      avatar: data.avatar,
      publicEmail: data.publicEmail,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error("Error loading user profile:", error);
    return null;
  }
}