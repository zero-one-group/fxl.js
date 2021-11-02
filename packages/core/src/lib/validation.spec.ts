import * as styles from './styles';
import { validateCell, validateCoord } from './validation';

describe('validation functions', () => {
  const validCoord = { row: 0, col: 0 };
  const validCell = { value: 'abc', coord: validCoord };

  it('validateCoord', () => {
    const invalidCoord = { row: -1, col: 0 };
    const invalidCell = { value: 'abc', coord: invalidCoord };
    expect(validateCoord(validCell).val).toEqual(validCell);
    const withSheet = { ...validCoord, sheet: 'ABC' };
    const validCellWithSheet = { ...validCell, coord: withSheet };
    expect(validateCoord(validCellWithSheet).val).toEqual(validCellWithSheet);
    expect(validateCoord(invalidCell).val).toHaveProperty('error');
  });

  it('color validation should work', () => {
    ['ZZ', 'ZZZZZZZZ', 'FF', '', 'FFFFFFFFFF'].forEach((color) => {
      const unknownColor = styles.setFontColor(color)(validCell);
      expect(validateCell(unknownColor).val).toHaveProperty('error');
    });
    ['FF5D8AA8', 'FFFFFFFF', '01234567'].forEach((color) => {
      const validColor = styles.setFontColor(color)(validCell);
      expect(validateCell(validColor).val).toHaveProperty('value');
    });
  });

  it('validateCell should work', () => {
    const invalidCoord = { row: -1, col: 0 };
    const invalidCell = { value: 'abc', coord: invalidCoord };
    expect(validateCell(validCell).val).toEqual(validCell);
    expect(validateCell(invalidCell).val).toHaveProperty('error');
  });
});
