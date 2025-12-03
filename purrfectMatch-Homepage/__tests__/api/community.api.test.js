// Unit tests for api/community.ts using mocked firebase/firestore

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    addDoc: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    Timestamp: { now: () => ({}) },
    doc: jest.fn(),
    updateDoc: jest.fn(),
    increment: jest.fn((n) => n),
    deleteDoc: jest.fn(),
    writeBatch: jest.fn(() => ({ delete: jest.fn(), commit: jest.fn() })),
    getDoc: jest.fn(),
    arrayUnion: jest.fn((x) => x),
}));

const {
    createCommunityPostFirebase,
    listCommunityPostsFirebase,
    deleteCommunityPostFirebase,
    editCommunityPostFirebase,
    getCommentsFirebase,
    addCommentFirebase,
    deleteCommunityCommentFirebase,
    editCommunityCommentFirebase,
    toggleLikeFirebase,
    getLikeStatusFirebase,
} = require('../../api/community');

const { addDoc, getDocs } = require('firebase/firestore');

beforeEach(() => {
    // Clear invocation history but keep implementations from the module-level jest.mock
    jest.clearAllMocks();
});

test('createCommunityPostFirebase returns id when addDoc resolves', async () => {
    addDoc.mockResolvedValue({ id: 'cpost1' });
    const payload = { authorId: 'u1', username: 'a', petType: 'dog', category: 'tips', description: 'hi' };
    const res = await createCommunityPostFirebase(payload);
    expect(res).toEqual({ id: 'cpost1', success: true });
    expect(addDoc).toHaveBeenCalled();
});

test('listCommunityPostsFirebase returns posts and supports filters and search', async () => {
    const fakeDoc = { id: 'x1', data: () => ({ description: 'Test desc', petType: 'dog', category: 'tips', createdAt: { toDate: () => new Date() }, likes: 1, comments: 0 }) };
    getDocs.mockResolvedValue({ docs: [fakeDoc] });

    const resAll = await listCommunityPostsFirebase();
    expect(resAll).toHaveLength(1);

    const resFiltered = await listCommunityPostsFirebase({ petType: 'dog' });
    expect(resFiltered).toHaveLength(1);

    const resSearched = await listCommunityPostsFirebase({ searchQuery: 'test' });
    expect(resSearched).toHaveLength(1);
});

test('deleteCommunityPostFirebase throws if no postId and returns success when called (minimal)', async () => {
    await expect(deleteCommunityPostFirebase('')).rejects.toThrow('postId is required');

    // Simulate getDocs responses for likes/comments and successful batch commit
    const fakeRefDoc = { ref: 'r1', id: 'l1' };
    getDocs.mockResolvedValue({ forEach: (fn) => fn(fakeRefDoc), docs: [fakeRefDoc] });
    const res = await deleteCommunityPostFirebase('p1');
    expect(res).toEqual({ success: true });
});

test('editCommunityPostFirebase handles missing and existing posts', async () => {
    const { getDoc, updateDoc } = require('firebase/firestore');
    getDoc.mockResolvedValueOnce({ exists: () => false });
    const resFalse = await editCommunityPostFirebase('no', 'x');
    expect(resFalse).toEqual({ success: false });

    getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ description: 'old' }) });
    updateDoc.mockResolvedValueOnce(true);
    const resTrue = await editCommunityPostFirebase('p1', 'new');
    expect(resTrue).toEqual({ success: true });
});

test('comments: getCommentsFirebase maps and addCommentFirebase increments post', async () => {
    const fakeComment = { id: 'c1', data: () => ({ postId: 'p1', authorId: 'u', username: 'a', content: 'hi', createdAt: { toDate: () => new Date() } }) };
    getDocs.mockResolvedValueOnce({ docs: [fakeComment] });
    const comments = await getCommentsFirebase('p1');
    expect(Array.isArray(comments)).toBe(true);

    const { updateDoc } = require('firebase/firestore');
    addDoc.mockResolvedValueOnce({ id: 'c2' });
    updateDoc.mockResolvedValueOnce(true);
    const res = await addCommentFirebase({ postId: 'p1', authorId: 'u', username: 'a', content: 'x' });
    expect(res).toEqual({ success: true });
});

test('deleteCommunityCommentFirebase and editCommunityCommentFirebase behave correctly', async () => {
    const { deleteDoc, updateDoc, getDoc } = require('firebase/firestore');
    deleteDoc.mockResolvedValueOnce(true);
    updateDoc.mockResolvedValueOnce(true);
    const resDel = await deleteCommunityCommentFirebase('c1', 'p1');
    expect(resDel).toEqual({ success: true });

    getDoc.mockResolvedValueOnce({ exists: () => false });
    const resEditFalse = await editCommunityCommentFirebase('no', 'x');
    expect(resEditFalse).toEqual({ success: false });

    getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ content: 'old' }) });
    updateDoc.mockResolvedValueOnce(true);
    const resEditTrue = await editCommunityCommentFirebase('c1', 'new');
    expect(resEditTrue).toEqual({ success: true });
});

test('toggleLikeFirebase and getLikeStatusFirebase', async () => {
    const { getDocs, addDoc, deleteDoc, updateDoc } = require('firebase/firestore');
    getDocs.mockResolvedValueOnce({ empty: true, docs: [] });
    addDoc.mockResolvedValueOnce({ id: 'l1' });
    updateDoc.mockResolvedValueOnce(true);
    const addRes = await toggleLikeFirebase('p1', 'u1');
    expect(addRes).toEqual({ liked: true });

    const fakeLikeDoc = { ref: 'r1', id: 'l1' };
    getDocs.mockResolvedValueOnce({ empty: false, docs: [fakeLikeDoc] });
    deleteDoc.mockResolvedValueOnce(true);
    updateDoc.mockResolvedValueOnce(true);
    const remRes = await toggleLikeFirebase('p1', 'u1');
    expect(remRes).toEqual({ liked: false });

    getDocs.mockResolvedValueOnce({ empty: false });
    const liked = await getLikeStatusFirebase('p1', 'u1');
    expect(liked).toBe(true);
});
