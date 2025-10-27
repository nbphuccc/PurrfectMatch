// import React from 'react';
// import { render } from '@testing-library/react-native';
// import Profile from '../app/(tabs)/profile';

// // Mock expo-router to avoid runtime navigation calls during tests
// jest.mock('expo-router', () => ({
//   useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
// }));

// describe('Profile screen', () => {
//   test('renders Login title', () => {
//     const { getByText } = render(<Profile />);
//     expect(getByText('Login')).toBeTruthy();
//   });
// });

import { render } from '@testing-library/react-native';

import Profile from '../app/(tabs)/profile';

describe('<Profile />', () => {
  test('Text renders correctly on profile page', () => {
    const { getByText } = render(<Profile />);

    getByText('Login');
    getByText('Username or Email');
    getByText('Password');
    getByText('Forgot password?');
    getByText('LOGIN');
    getByText('Or create an account');
    getByText('SIGN UP');
  });
});
