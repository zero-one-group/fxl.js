import * as temp from 'temp';

import * as fxl from './core';
import * as t from './types';

const XLSX_PATH = 'packages/core/src/data/dummy-spreadsheet.xlsx';

temp.track();

describe('basic reading and writing xlsx', () => {
  it('readXlsx should return valid cells', async () => {
		const cells = await fxl.readXlsx(XLSX_PATH);
    expect(cells.length).toBe(23);
    expect(cells.map(fxl.validateCell).filter(t.isError)).toEqual([]);
  });

  it('writeXlsx should take in valid cells', async () => {
    const cells = [fxl.toCell('abc')];
    const tempFile = temp.openSync('excel-temp');
    await fxl.writeXlsx(cells, tempFile.path);
    const loadedCells = await fxl.readXlsx(tempFile.path);
    expect(loadedCells.length).toBe(cells.length);
    expect(loadedCells.map((x) => x.value)).toEqual(cells.map((x) => x.value));
  });
});

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
