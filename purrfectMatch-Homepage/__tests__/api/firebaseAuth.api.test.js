// Unit tests for api/firebaseAuth.ts - mock firebase/auth and firestore to avoid emulator

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  Timestamp: { now: () => ({ toDate: () => new Date() }) },
}));

// jest.setup.js provides a mock for './api/firebaseAuth' for other tests.
// Here we need the real implementation to unit-test its logic, so load the actual module.
const authApi = jest.requireActual('../../api/firebaseAuth');
const {
  signupFirebase,
  loginFirebase,
  logoutFirebase,
  getCurrentUser,
  setUserProfileFirebase,
  getUserProfileFirebase,
  updateProfileFirebase,
} = authApi;

const { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { setDoc, getDoc } = require('firebase/firestore');

beforeEach(() => jest.clearAllMocks());

test('signupFirebase validates email, password and username', async () => {
  const res1 = await signupFirebase({ email: 'bad', username: 'u', password: '123456' });
  expect(res1.ok).toBe(false);

  const res2 = await signupFirebase({ email: 'a@b.com', username: '', password: '123456' });
  expect(res2.ok).toBe(false);

  const res3 = await signupFirebase({ email: 'a@b.com', username: 'u', password: '123' });
  expect(res3.ok).toBe(false);
});

test('signupFirebase handles successful signup', async () => {
  createUserWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: 'u1', email: 'a@b.com' } });
  const res = await signupFirebase({ email: 'a@b.com', username: 'alice', password: '123456' });
  expect(res.ok).toBe(true);
  expect(createUserWithEmailAndPassword).toHaveBeenCalled();
});

test('loginFirebase validates and handles success', async () => {
  const invalid = await loginFirebase({ email: 'bad', password: 'x' });
  expect(invalid.ok).toBe(false);

  signInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: 'u1', email: 'a@b.com', displayName: 'alice' } });
  const res = await loginFirebase({ email: 'a@b.com', password: 'pw' });
  expect(res.ok).toBe(true);
  expect(signInWithEmailAndPassword).toHaveBeenCalled();
});

test('logoutFirebase calls signOut', async () => {
  signOut.mockResolvedValueOnce(true);
  await expect(logoutFirebase()).resolves.toBeUndefined();
  expect(signOut).toHaveBeenCalled();
});

test('profile set/get/update flows', async () => {
  setDoc.mockResolvedValueOnce(true);
  const setRes = await setUserProfileFirebase('u1', { email: 'a@b.com', username: 'a', name: '', bio: '', avatar: '', publicEmail: false });
  expect(setRes).toEqual({ success: true });

  // getUserProfile: invalid id returns null
  const bad = await getUserProfileFirebase('');
  expect(bad).toBeNull();

  // existing doc
  getDoc.mockResolvedValueOnce({ exists: () => true, id: 'u1', data: () => ({ email: 'a@b.com', username: 'a', name: '', bio: '', avatar: '', publicEmail: false, createdAt: { toDate: () => new Date() }, updatedAt: { toDate: () => new Date() } }) });
  const profile = await getUserProfileFirebase('u1');
  expect(profile).not.toBeNull();

  // updateProfileFirebase: when profile exists
  getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({}) });
  setDoc.mockResolvedValueOnce(true);
  const upd = await updateProfileFirebase('u1', { name: 'New' });
  expect(upd).toEqual({ success: true });
});
