import { createCommunityPost } from '../../api/community';
import { api } from '../../api/Client';

jest.mock('../../api/Client', () => ({
    api: { post: jest.fn() },
}));

describe('createCommunityPost', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('maps client DTO to server DTO and posts to /community', async () => {
        // Arrange: client DTO shape
        const clientDto = {
            petType: 'Cat',
            category: 'Resource',
            description: 'Need a good vet',
            image: 'https://example.com/cat.jpg',
        };

        // Prepare mocked server response
        const serverResponse = { id: 42, author_id: 1, title: 'Resource - Cat', description: 'Need a good vet', image_url: 'https://example.com/cat.jpg' };
        (api.post as jest.Mock).mockResolvedValueOnce({ data: serverResponse });

        // Act
        const result = await createCommunityPost(clientDto as any);

        // Assert: api.post called with /community and server-shaped DTO
        expect(api.post).toHaveBeenCalledTimes(1);
        const [path, posted] = (api.post as jest.Mock).mock.calls[0];
        expect(path).toBe('/community');
        expect(posted).toMatchObject({
            author_id: 1,
            title: 'Resource - Cat',
            description: 'Need a good vet',
            image_url: 'https://example.com/cat.jpg',
        });

        // And the helper returns the server data
        expect(result).toEqual(serverResponse);
    });
});
