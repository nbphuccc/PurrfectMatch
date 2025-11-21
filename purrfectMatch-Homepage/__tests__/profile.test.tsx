import React from 'react';
import { render } from '@testing-library/react-native';

import Profile from '../app/(tabs)/profile';

describe('<Profile />', () => {
  test('Text renders correctly on profile page', () => {
    const { getByText } = render(<Profile />);

    getByText('Login');
    getByText('Email');
    getByText('Password');
    getByText('Forgot password?');
    getByText('LOGIN');
    getByText('Or create an account');
    getByText('SIGN UP');
  });
});
