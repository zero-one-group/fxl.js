import { validateCell, validateCoord } from './validation';

describe('validation functions', () => {
  const validCoord = { row: 0, col: 0 };
  const validCell = { value: 'abc', coord: validCoord };
  const invalidCoord = { row: -1, col: 0 };
  const invalidCell = { value: 'abc', coord: invalidCoord };

  it('validateCoord', () => {
    expect(validateCoord(validCoord).val).toEqual(validCoord);
    const withSheet = { ...validCoord, sheet: 'ABC' };
    expect(validateCoord(withSheet).val).toEqual(withSheet);
    expect(validateCoord(invalidCoord).val).toHaveProperty('error');
  });

  it('validateCell should work', () => {
    expect(validateCell(validCell).val).toEqual(validCell);
    expect(validateCell(invalidCell).val).toHaveProperty('error');
  });
});
