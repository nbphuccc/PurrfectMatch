const React = require('react');
const { render, waitFor } = require('@testing-library/react-native');

// Purpose: quick frontend unit test for the Community feed screen.
// This file keeps the test purely frontend by mocking all Firebase and
// navigation dependencies. It asserts that the static header renders and
// that one mocked post description appears in the feed.

// Mocks
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
    useFocusEffect: (_fn) => { },
}));
jest.mock('@react-navigation/native', () => ({
    useFocusEffect: (_fn) => { },
}));

jest.mock('../api/community', () => ({
    listCommunityPostsFirebase: jest.fn(async () => [
        {
            id: 'c1',
            authorId: 'u1',
            username: 'charlie',
            createdAt: new Date(),
            petType: 'Cat',
            category: 'Resource',
            description: 'Free cat toys',
            imageUrl: null,
            likes: 1,
            comments: 0,
        },
    ]),
    createCommunityPostFirebase: jest.fn(() => Promise.resolve()),
    toggleLikeFirebase: jest.fn(() => Promise.resolve()),
    getLikeStatusFirebase: jest.fn(() => Promise.resolve(false)),
}));

jest.mock('../api/firebaseAuth', () => ({
    getCurrentUser: jest.fn(() => ({ uid: 'u1', displayName: 'charlie' })),
    getUserProfileFirebase: jest.fn(async (id) => ({ avatar: '' })),
}));

// Import the component after setting up mocks so it reads the mocked modules.
const CommunityScreen = require('../app/(tabs)/index').default;

describe('Community screen - frontend unit', () => {
    beforeEach(() => jest.clearAllMocks());

    it('renders header and a community post description', async () => {
        // Render the screen. All firebase calls are mocked above so no network
        // activity occurs and the mocked post is returned synchronously.
        const tree = render(React.createElement(CommunityScreen));

        // Wait for the UI to update and confirm the header and mocked post text
        // are present in the rendered output.
        await waitFor(() => {
            expect(tree.getByText('Share, Ask, and Help Other Pet Owners!')).toBeTruthy();
            expect(tree.getByText('Free cat toys')).toBeTruthy();
        });
    });
});
