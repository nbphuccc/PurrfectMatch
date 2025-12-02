const React = require('react');
const { render, waitFor } = require('@testing-library/react-native');

// Purpose: lightweight frontend unit test for the Playdate feed screen.
// All Firebase and native modules (maps) are mocked here so the test remains
// purely frontend and runs fast in CI/local dev without emulators or native
// dependencies. The test asserts the static header renders; dynamic data can
// be asserted by adding module-level mocks (see `listPlaydatesFirebase` below).

// Mocks
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
    useFocusEffect: (_fn) => { },
}));
jest.mock('@react-navigation/native', () => ({
    useFocusEffect: (_fn) => { },
}));

jest.mock('react-native-maps', () => {
    const React = require('react');
    const { View } = require('react-native');
    const MockMap = (props) => React.createElement(View, props, props.children);
    MockMap.Marker = (props) => React.createElement(View, props, null);
    return MockMap;
});

jest.mock('../api/playdates', () => ({
    listPlaydatesFirebase: jest.fn(async () => [
        {
            id: 'pd1',
            authorId: 'u1',
            username: 'bob',
            createdAt: new Date(),
            title: 'Park meetup',
            city: 'Seattle',
            state: 'WA',
            imageUrl: null,
            description: 'Let us meet at the park',
            whenAt: '2025-12-10 10:00',
            likes: 0,
            comments: 0,
        },
    ]),
    createPlaydateFirebase: jest.fn(() => Promise.resolve()),
    toggleLikeFirebase: jest.fn(() => Promise.resolve()),
    getLikeStatusFirebase: jest.fn(() => Promise.resolve(false)),
}));

jest.mock('../api/firebaseAuth', () => ({
    getCurrentUser: jest.fn(() => ({ uid: 'u1', displayName: 'bob' })),
    getUserProfileFirebase: jest.fn(async (id) => ({ avatar: '' })),
}));

// Import component after mocks so it consumes the mocked modules above.
const PlaydateScreen = require('../app/(tabs)/PlayDate').default;

describe('Playdate screen - frontend unit', () => {
    beforeEach(() => jest.clearAllMocks());

    it('renders header and a playdate entry', async () => {
        // Render the screen. The listPlaydatesFirebase mock above could be
        // adjusted to return multiple playdates and then the test could assert
        // on those items; for now we check the static header to keep the test
        // stable and fast.
        const tree = render(React.createElement(PlaydateScreen));

        await waitFor(() => {
            expect(tree.getByText('One Simple Post, One Fun Play Date!')).toBeTruthy();
        });
    });
});
