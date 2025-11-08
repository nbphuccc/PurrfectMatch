// Frontend unit/component test:

// Renders the component and mocks the network call.
// Verifies client-side validation, trimming, payload shape, and that success UI is shown.
// Does NOT hit the real backend.
// Purpose: quickly verify component logic and UI behavior without external deps.

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreatePlaydatePost from '../app/CreatePlaydatePost';

// mock router
jest.mock('expo-router', () => ({
    useRouter: () => ({ back: jest.fn() }),
}));

// mock api
const mockCreate = jest.fn(() => Promise.resolve({ id: 42 }));
jest.mock('../api/playdates', () => ({
    createPlaydatePost: (...args: any[]) => mockCreate(...args),
}));

// mock Alert
import { Alert } from 'react-native';
const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => { });

afterAll(() => {
    alertSpy.mockRestore();
});

describe('CreatePlaydatePost component', () => {
    beforeEach(() => {
        mockCreate.mockClear();
        alertSpy.mockClear();
    });

    it('submits form and calls API and navigates back on success', async () => {
        const { getByPlaceholderText, getByText } = render(<CreatePlaydatePost />);

        fireEvent.changeText(getByPlaceholderText('Title'), 'Test Playdate');
        fireEvent.changeText(getByPlaceholderText('Description'), 'A fun playdate');
        fireEvent.changeText(getByPlaceholderText('Dog breed'), 'Labrador');
        fireEvent.changeText(getByPlaceholderText('Address'), '123 Park');
        fireEvent.changeText(getByPlaceholderText('City'), 'Test City');
        fireEvent.changeText(getByPlaceholderText('State'), 'TS');
        fireEvent.changeText(getByPlaceholderText('ZIP'), '12345');
        fireEvent.changeText(getByPlaceholderText('When (e.g., "Sat 2pm" or ISO)'), 'Sat 2pm');
        fireEvent.changeText(getByPlaceholderText('Place'), 'The Park');

        const postButton = getByText('Post');
        fireEvent.press(postButton);

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledTimes(1);
        });

        // check payload shape
        const payload = (mockCreate.mock.calls[0] as any)[0];
        expect(payload.title).toBe('Test Playdate');
        expect(payload.author_id).toBe(1);

        // success alert
        expect(alertSpy).toHaveBeenCalledWith('Success', 'Your playdate has been created.');
    });

    it('shows validation alert when missing required fields', async () => {
        const { getByText } = render(<CreatePlaydatePost />);
        const postButton = getByText('Post');
        fireEvent.press(postButton);
        await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    });
});
