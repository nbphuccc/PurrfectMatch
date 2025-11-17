import http from 'http';

// Start the Express app in-process for e2e scaffolding tests. Returns the
// running server and the base URL to use for requests.
export async function startServer(): Promise<{ server: http.Server; url: string }> {
    // Ensure integration/e2e uses an in-memory DB
    process.env.DB_PATH = ':memory:';
    // Import app lazily after env set
    const { default: app } = await import('../../../../src/app.js');

    return new Promise((resolve, reject) => {
        const server = app.listen(0, '127.0.0.1', () => {
            const addr = server.address();
            if (!addr || typeof addr === 'string') return reject(new Error('Failed to start server'));
            const url = `http://${addr.address}:${addr.port}`;
            resolve({ server, url });
        });
        server.on('error', reject);
    });
}
