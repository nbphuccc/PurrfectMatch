// Purpose: small, stable frontend unit test for Profile screen.
// It mocks navigation and firebase helpers so no network or emulator is required.
const React = require('react');
const { render, waitFor } = require('@testing-library/react-native');

// Mock navigation focus and router so screen doesn't require a NavigationContainer
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
    useFocusEffect: (_fn) => { },
}));
jest.mock('@react-navigation/native', () => ({
    useFocusEffect: (_fn) => { },
}));

// Mock the firebaseAuth helpers used by Profile so it won't call real Firebase
jest.mock('../api/firebaseAuth', () => ({
    loginFirebase: jest.fn(() => Promise.resolve({ ok: true })),
    logoutFirebase: jest.fn(() => Promise.resolve()),
    getCurrentUser: jest.fn(() => null),
    getUserProfileFirebase: jest.fn(async (id) => null),
}));

// Import the Profile component after mocks
const Profile = require('../app/(tabs)/profile').default;

describe('Profile screen - simple frontend test', () => {
    beforeEach(() => jest.clearAllMocks());

    it('renders login form when not authenticated', async () => {
        const tree = render(React.createElement(Profile));

        await waitFor(() => {
            // Minimal checks: header and login button text
            expect(tree.getByText('Login')).toBeTruthy();
            expect(tree.getByText('LOGIN')).toBeTruthy();
        });
    });
});
