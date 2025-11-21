import '@testing-library/jest-native/extend-expect';

// Mock Firebase Auth
jest.mock('./api/firebaseAuth', () => ({
  signupFirebase: jest.fn(() => Promise.resolve({ ok: true })),
  loginFirebase: jest.fn(() => Promise.resolve({ ok: true })),
  logoutFirebase: jest.fn(() => Promise.resolve()),
  getCurrentUser: jest.fn(() => null),
}));

// Mock Firebase Config
jest.mock('./config/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

// Mock Firebase/Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn();
  }),
  updateProfile: jest.fn(),
}));

// Mock Firebase/Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  increment: jest.fn((n) => n),
  Timestamp: {
    now: jest.fn(() => ({ 
      toDate: () => new Date(),
      toMillis: () => Date.now() 
    })),
  },
}));
