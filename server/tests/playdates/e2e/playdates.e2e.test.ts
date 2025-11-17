import { startServer } from './helpers/startServer.js';

describe('Playdates E2E (in-process)', () => {
    let server: any;
    let url: string;

    beforeAll(async () => {
        const started = await startServer();
        server = started.server;
        url = started.url;
    }, 20000);

    afterAll(() => {
        if (server && server.close) server.close();
    });

    it('server responds on / (sanity)', async () => {
        const res = await fetch(`${url}/`);
        expect(res.status).toBeGreaterThanOrEqual(200);
    });
});
