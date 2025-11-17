/**
 * Unit tests for validation helpers.
 * Location: server/tests/community/unit/
 * Purpose: exercise small, deterministic functions that do not require the server.
 */
import { requireFields, pickDefined } from '../../../src/utils/validate.js';

describe('requireFields', () => {
    it('returns null when all required fields present', () => {
        const body = { a: 1, b: 'x' };
        expect(requireFields(body as any, ['a', 'b'])).toBeNull();
    });

    it('returns field name when missing', () => {
        const body = { a: 1 };
        expect(requireFields(body as any, ['a', 'b'])).toBe('b is required');
    });

    it('considers empty string as missing', () => {
        const body = { a: '' };
        expect(requireFields(body as any, ['a'])).toBe('a is required');
    });
});

describe('pickDefined', () => {
    it('picks only defined keys', () => {
        const obj = { a: 1, b: undefined, c: null };
        const picked = pickDefined(obj as any, ['a', 'b', 'c']);
        expect(picked).toEqual({ a: 1, c: null });
    });
});
