import * as fxl from './core';

describe('validators', () => {
  const validCoord = { row: 0, col: 0 };
  const validCell = { value: 'abc', coord: validCoord };
  const invalidCoord = { row: -1, col: 0 };
  const invalidCell = { value: 'abc', coord: invalidCoord };

  it('validateCoord should work', () => {
    expect(fxl.validateCoord(validCoord)).toEqual(validCoord);
    const validCoordWithSheet = { ...validCoord, sheet: 'ABC' };
    expect(fxl.validateCoord(validCoordWithSheet)).toEqual(validCoordWithSheet);
    expect(fxl.validateCoord(invalidCoord)).toHaveProperty('error');
  });

  it('validateCell should work', () => {
    expect(fxl.validateCell(validCell)).toEqual(validCell);
    expect(fxl.validateCell(invalidCell)).toHaveProperty('error');
  });
});

describe('core', () => {
  it('toCell should have sensible defaults', () => {
    const cellValue = 'abc-xyz';
    const cell = fxl.toCell(cellValue);
    expect(cell.value).toEqual(cellValue);
    expect(cell.coord).toEqual({ row: 0, col: 0 });
    expect(cell.style).toEqual({});
  });
});
