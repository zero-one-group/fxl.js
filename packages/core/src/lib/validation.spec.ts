import * as styles from './styles';
import * as t from './types';
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

    const validMergedCoord = { row: 0, col: 0, height: 1, width: 1 };
    const validMergedCell = { value: 'abc', coord: validMergedCoord };
    expect(validateCoord(validMergedCell).val).toEqual(validMergedCell);
    const invalidMergedCoord = { row: 0, col: 0, height: 0, width: 0 };
    const invalidMergedCell = { value: 'abc', coord: invalidMergedCoord };
    expect(validateCoord(invalidMergedCell).val).toHaveProperty('error');
  });

  it('font size validation should work', () => {
    const validFontSize = styles.setFontSize(10)(validCell);
    expect(validateCoord(validFontSize).val).toEqual(validFontSize);
    const invalidFontSize = styles.setFontSize(-1)(validCell);
    expect(validateCell(invalidFontSize).val).toHaveProperty('error');
  });

  it('cell size validation should work', () => {
    const validRowHeight = styles.setRowHeight(10)(validCell);
    expect(validateCoord(validRowHeight).val).toEqual(validRowHeight);
    const invalidRowHeight = styles.setRowHeight(-1)(validCell);
    expect(validateCell(invalidRowHeight).val).toHaveProperty('error');
  });

  it('color validation should work', () => {
    ['ZZ', 'ZZZZZZZZ', 'FF', '', 'FFFFFFFFFF'].forEach((color) => {
      const invalidFont = styles.setFontColor(color)(validCell);
      expect(validateCell(invalidFont).val).toHaveProperty('error');
      const border = styles.toBorder('thin', color);
      const invalidBorders = styles.setAllBorders(border)(validCell);
      expect(validateCell(invalidBorders).val).toHaveProperty('error');
      const invalidFgFill = styles.setSolidFg(color)(validCell);
      expect(validateCell(invalidFgFill).val).toHaveProperty('error');
      const invalidBgFill = styles.setSolidBg(color)(validCell);
      expect(validateCell(invalidBgFill).val).toHaveProperty('error');
    });
    ['FF5D8AA8', 'FFFFFFFF', '01234567'].forEach((color) => {
      const validFont = styles.setFontColor(color)(validCell);
      expect(validateCell(validFont).val).toHaveProperty('value');
      const border = styles.toBorder('thin', color);
      const validBorders = styles.setAllBorders(border)(validCell);
      expect(validateCell(validBorders).val).toHaveProperty('value');
      const validFgFill = styles.setSolidFg(color)(validCell);
      expect(validateCell(validFgFill).val).toHaveProperty('value');
      const validBgFill = styles.setSolidBg(color)(validCell);
      expect(validateCell(validBgFill).val).toHaveProperty('value');
    });

    const validFill: t.Fill = {
      type: 'gradient',
      gradient: 'angle',
      degree: 10,
      stops: [],
    };
    const validFillCell = { ...validCell, style: { fill: validFill } };
    expect(validateCell(validFillCell).val).toHaveProperty('value');
  });

  it('validateCell should work', () => {
    const invalidCoord = { row: -1, col: 0 };
    const invalidCell = { value: 'abc', coord: invalidCoord };
    expect(validateCell(validCell).val).toEqual(validCell);
    expect(validateCell(invalidCell).val).toHaveProperty('error');
  });
});
