import * as t from './types';

describe('type guards', () => {
  it('isError type checks correctly', () => {
    expect(t.isError({ error: 'abc' })).toBe(true);
    expect(t.isError({ error: 'xyz', a: 1 })).toBe(true);
    expect(t.isError({})).toBe(false);
    expect(t.isError(undefined)).toBe(false);
  });
});
