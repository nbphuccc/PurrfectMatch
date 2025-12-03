// Simple unit tests for api/playdates.ts using Jest and mocks for firebase/firestore

// Mock firebase/firestore functions used by api/playdates.ts
jest.mock('firebase/firestore', () => {
    return {
        collection: jest.fn(),
        addDoc: jest.fn(),
        getDocs: jest.fn(),
        query: jest.fn(),
        where: jest.fn(),
        orderBy: jest.fn(),
        Timestamp: { now: () => ({}) },
        deleteDoc: jest.fn(),
        doc: jest.fn(),
        updateDoc: jest.fn(),
        increment: jest.fn((n) => n),
        writeBatch: jest.fn(() => ({ delete: jest.fn(), commit: jest.fn() })),
        getDoc: jest.fn(),
        arrayUnion: jest.fn((x) => x),
    };
});

const {
    createPlaydateFirebase,
    listPlaydatesFirebase,
    getLikeStatusFirebase,
    deletePlaydatePostFirebase,
} = require('../../api/playdates');

// Import additional functions to test
const {
    listPlaydatesByCityFirebase,
    editPlaydatePostFirebase,
    addPlaydateCommentFirebase,
    getPlaydateCommentsFirebase,
    deletePlaydateCommentFirebase,
    editPlaydateCommentFirebase,
    toggleLikeFirebase,
} = require('../../api/playdates');

const { addDoc, getDocs } = require('firebase/firestore');

beforeEach(() => {
    // Clear call history but keep module-level mock implementations (e.g. writeBatch)
    jest.clearAllMocks();
});

// console is globally silenced in jest.setup.js; no local suppression needed

test('createPlaydateFirebase returns id and success when addDoc resolves', async () => {
    addDoc.mockResolvedValue({ id: 'abc123' });

    const payload = {
        authorId: 'u1',
        username: 'alice',
        title: 'Dog park meetup',
        description: 'Playdate for small dogs',
        dogBreed: 'Beagle',
        address: '123 Park Ave',
        city: 'Testville',
        state: 'TS',
        zip: '11111',
        whenAt: '2025-12-10',
        place: 'Central Park',
        likes: 0,
        comments: 0,
        createdAt: new Date(),
    };

    const res = await createPlaydateFirebase(payload);
    expect(res).toEqual({ id: 'abc123', success: true });
    expect(addDoc).toHaveBeenCalled();
});

test('listPlaydatesFirebase maps snapshot.docs to playdate objects', async () => {
    const fakeDate = new Date('2020-01-01T00:00:00Z');
    const fakeDoc = {
        id: 'p1',
        data: () => ({ title: 'Walk', createdAt: { toDate: () => fakeDate }, likes: 2 }),
    };
    getDocs.mockResolvedValue({ docs: [fakeDoc] });

    const list = await listPlaydatesFirebase();
    expect(Array.isArray(list)).toBe(true);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('p1');
    expect(list[0].title).toBe('Walk');
    expect(list[0].createdAt instanceof Date).toBe(true);
});

test('getLikeStatusFirebase returns correct boolean based on snapshot.empty', async () => {
    // when not empty => liked
    getDocs.mockResolvedValueOnce({ empty: false });
    const liked = await getLikeStatusFirebase('post1', 'user1');
    expect(liked).toBe(true);

    // when empty => not liked
    getDocs.mockResolvedValueOnce({ empty: true });
    const notLiked = await getLikeStatusFirebase('post1', 'user1');
    expect(notLiked).toBe(false);
});

test('deletePlaydatePostFirebase throws when postId is missing', async () => {
    await expect(deletePlaydatePostFirebase('')).rejects.toThrow('postId is required');
});


test('listPlaydatesByCityFirebase filters by city and returns mapped results', async () => {
    const fakeDoc = {
        id: 'p2',
        data: () => ({ title: 'Park Play', createdAt: { toDate: () => new Date() }, city: 'Testville' }),
    };
    getDocs.mockResolvedValue({ docs: [fakeDoc] });

    const list = await listPlaydatesByCityFirebase('Testville');
    expect(list).toHaveLength(1);
    expect(list[0].city).toBe('Testville');
});

test('editPlaydatePostFirebase returns false when post does not exist and true when it does', async () => {
    const { getDoc, updateDoc } = require('firebase/firestore');

    // non-existent post
    getDoc.mockResolvedValueOnce({ exists: () => false });
    const resFalse = await editPlaydatePostFirebase('nope', 'new');
    expect(resFalse).toEqual({ success: false });

    // existing post: return data with description
    getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ description: 'old' }) });
    updateDoc.mockResolvedValueOnce(true);
    const resTrue = await editPlaydatePostFirebase('p1', 'updated');
    expect(resTrue).toEqual({ success: true });
});

test('addPlaydateCommentFirebase adds a comment and increments post comments', async () => {
    const { addDoc, updateDoc } = require('firebase/firestore');
    addDoc.mockResolvedValueOnce({ id: 'c1' });
    updateDoc.mockResolvedValueOnce(true);

    const res = await addPlaydateCommentFirebase({ postId: 'p1', authorId: 'u1', username: 'a', content: 'hi' });
    expect(res).toEqual({ success: true });
    expect(addDoc).toHaveBeenCalled();
    expect(updateDoc).toHaveBeenCalled();
});

test('getPlaydateCommentsFirebase returns sorted comments and handles no results', async () => {
    const fakeDocA = {
        id: 'cA',
        data: () => ({ postId: 'p1', authorId: 'u1', username: 'a', content: 'first', createdAt: { toDate: () => new Date('2020-01-02') } }),
    };
    const fakeDocB = {
        id: 'cB',
        data: () => ({ postId: 'p1', authorId: 'u2', username: 'b', content: 'second', createdAt: { toDate: () => new Date('2020-01-01') } }),
    };
    getDocs.mockResolvedValueOnce({ docs: [fakeDocA, fakeDocB] });

    const comments = await getPlaydateCommentsFirebase('p1');
    expect(comments).toHaveLength(2);
    // comments sorted newest first
    expect(comments[0].createdAt.getTime()).toBeGreaterThanOrEqual(comments[1].createdAt.getTime());

    // If getDocs throws, function should return [] (handled in implementation)
    getDocs.mockRejectedValueOnce(new Error('fail'));
    const commentsOnError = await getPlaydateCommentsFirebase('p1');
    expect(Array.isArray(commentsOnError)).toBe(true);
});

test('deletePlaydateCommentFirebase deletes and decrements post comments', async () => {
    const { deleteDoc, updateDoc } = require('firebase/firestore');
    deleteDoc.mockResolvedValueOnce(true);
    updateDoc.mockResolvedValueOnce(true);

    const res = await deletePlaydateCommentFirebase('c1', 'p1');
    expect(res).toEqual({ success: true });
    expect(deleteDoc).toHaveBeenCalled();
    expect(updateDoc).toHaveBeenCalled();
});

test('editPlaydateCommentFirebase returns false when not exists and true when edited', async () => {
    const { getDoc, updateDoc } = require('firebase/firestore');
    getDoc.mockResolvedValueOnce({ exists: () => false });
    const resFalse = await editPlaydateCommentFirebase('no', 'x');
    expect(resFalse).toEqual({ success: false });

    getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ content: 'old' }) });
    updateDoc.mockResolvedValueOnce(true);
    const resTrue = await editPlaydateCommentFirebase('c1', 'new');
    expect(resTrue).toEqual({ success: true });
});

test('toggleLikeFirebase adds like when none exists and removes when exists', async () => {
    const { getDocs, addDoc, deleteDoc, updateDoc } = require('firebase/firestore');

    // case: no like exists -> add like
    getDocs.mockResolvedValueOnce({ empty: true, docs: [] });
    addDoc.mockResolvedValueOnce({ id: 'like1' });
    updateDoc.mockResolvedValueOnce(true);
    const addRes = await toggleLikeFirebase('p1', 'u1');
    expect(addRes).toEqual({ liked: true });

    // case: like exists -> remove like
    const fakeLikeDoc = { ref: 'r1', id: 'l1' };
    getDocs.mockResolvedValueOnce({ empty: false, docs: [fakeLikeDoc] });
    deleteDoc.mockResolvedValueOnce(true);
    updateDoc.mockResolvedValueOnce(true);
    const remRes = await toggleLikeFirebase('p1', 'u1');
    expect(remRes).toEqual({ liked: false });
});
