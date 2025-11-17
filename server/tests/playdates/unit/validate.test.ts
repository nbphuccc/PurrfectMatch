import { requireFields, pickDefined } from '../../../src/utils/validate.js';

describe('playdates validation helpers', () => {
    it('requireFields returns error when missing required playdate fields', () => {
        const body = { title: 'p', description: 'd' };
        const err = requireFields(body as any, ['title', 'description', 'dog_breed']);
        expect(err).toBe('dog_breed is required');
    });

    it('pickDefined filters allowed playdate fields', () => {
        const obj = { title: 't', foo: 'x', dog_breed: 'beagle' };
        const picked = pickDefined(obj as any, ['title', 'dog_breed']);
        expect(picked).toEqual({ title: 't', dog_breed: 'beagle' });
    });
});
