import { jest } from '@jest/globals';

// mock the db module used by CommentsDAO
const mockPrepare = jest.fn(() => ({
  all: jest.fn().mockReturnValue([]),
  run: jest.fn().mockReturnValue({ lastInsertRowid: 123 }),
  get: jest.fn().mockReturnValue(undefined),
}));

// jest ESM mock using manual mocking: replace the module path with the actual import used in CommentsDAO
jest.unstable_mockModule('../../src/index.js', () => ({
  default: {
    prepare: mockPrepare,
  },
}));

const { CommentsDAO } = await import('../../src/dao/CommentsDAO.js');

describe('CommentsDAO (unit)', () => {
  test('insert returns lastInsertRowid', () => {
    const id = CommentsDAO.insert({ post_type: 'community', post_id: 1, author_id: 1, body: 'hi' });
    expect(id).toBe(123);
    expect(mockPrepare).toHaveBeenCalled();
  });
});
