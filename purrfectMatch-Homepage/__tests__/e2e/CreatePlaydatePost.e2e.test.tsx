import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreatePlaydatePost from '../../app/CreatePlaydatePost';
import PlaydateScreen from '../../app/(tabs)/PlayDate';
import { startServer, stopServer } from '../../tests/e2e/helpers/setupServer';
import { Alert } from 'react-native';

jest.spyOn(Alert, 'alert').mockImplementation(() => { });
import { api } from '../../api/Client';

jest.setTimeout(20000);

describe('E2E CreatePlaydatePost', () => {
    let baseUrl: string;

    beforeAll(async () => {
        baseUrl = await startServer();
        // point the api client to spawned server
        api.defaults.baseURL = baseUrl;
    });

    afterAll(async () => {
        await stopServer();
    });

    it('creates a playdate via the real backend', async () => {
        // render the feed screen (sanity) and then render the full create form
        render(<PlaydateScreen />);
        const { getByPlaceholderText, getByText } = render(<CreatePlaydatePost />);

        // Use valid date/time formats that the PlayDate form expects (YYYY-MM-DD and HH:MM)
        fireEvent.changeText(getByPlaceholderText('Title'), 'E2E Front Title');
        fireEvent.changeText(getByPlaceholderText('Description'), 'E2E desc');
        fireEvent.changeText(getByPlaceholderText('Dog breed'), 'Beagle');
        //fireEvent.changeText(getByPlaceholderText('Address'), '1 E2E St');
        fireEvent.changeText(getByPlaceholderText('City'), 'City');
        fireEvent.changeText(getByPlaceholderText('State'), 'ST');
        fireEvent.changeText(getByPlaceholderText('When (e.g., "Sat 2pm" or ISO)'), '14:30');
        fireEvent.changeText(getByPlaceholderText('Place'), 'Park');

        fireEvent.press(getByText('Post'));

        // after submit the backend should have the new post; GET /playdates should return it
        await waitFor(async () => {
            const resp = await api.get('/playdates');
            const data: any = resp.data;
            const found = data.items.find((p: any) => p.title === 'E2E Front Title');
            expect(found).toBeDefined();
        });
    });
});
