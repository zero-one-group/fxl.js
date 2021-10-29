import * as temp from 'temp';
import { Result, Option } from 'ts-results';

import * as fxl from './core';

const XLSX_PATH = 'packages/core/src/data/dummy-spreadsheet.xlsx';

temp.track();

function extractSome<T>(option: Option<T>): T {
  if (option.some) {
    return option.val;
  } else {
    throw new Error('option is None');
  }
}

function extractOk<T, U>(result: Result<T, U>): T {
  if (result.ok) {
    return result.val;
  } else {
    throw new Error('result is not ok');
  }
}

describe('basic reading and writing xlsx', () => {
  it('readXlsx should return valid cells', async () => {
    const result = await fxl.readXlsx(XLSX_PATH);
    const cells = extractOk(result);
    expect(cells.length).toBe(23);
    expect(cells.map(fxl.validateCell).filter((x) => x.err)).toEqual([]);
  });

  it('readXlsx should fail gracefully', async () => {
    const result = await fxl.readXlsx('some/none/existent/path');
    expect(result.val).toHaveProperty('error');
  });

  it('writeXlsx should take in valid cells', async () => {
    const cell = fxl.toCell('abc');
    const tempFile = temp.openSync('excel-temp');
    await fxl.writeXlsx([cell], tempFile.path);
    const result = await fxl.readXlsx(tempFile.path);
    const loadedCells = extractOk(result);
    expect(loadedCells.length).toBe(1);
    expect(loadedCells.map((x) => x.value)).toEqual([cell.value]);
  });

  it('writeXlsx should fail gracefully', async () => {
    const cell = { ...fxl.toCell('abc'), coord: { row: -1, col: 0 } };
    const tempFile = temp.openSync('excel-temp');
    const result = await fxl.writeXlsx([cell], tempFile.path);
    const error = extractSome(result);
    expect(error).toHaveProperty('error');
  });
});

describe('validation', () => {
  const validCoord = { row: 0, col: 0 };
  const validCell = { value: 'abc', coord: validCoord };
  const invalidCoord = { row: -1, col: 0 };
  const invalidCell = { value: 'abc', coord: invalidCoord };

  it('validateCoord', () => {
    expect(fxl.validateCoord(validCoord).val).toEqual(validCoord);
    const withSheet = { ...validCoord, sheet: 'ABC' };
    expect(fxl.validateCoord(withSheet).val).toEqual(withSheet);
    expect(fxl.validateCoord(invalidCoord).val).toHaveProperty('error');
  });

  it('validateCell should work', () => {
    expect(fxl.validateCell(validCell).val).toEqual(validCell);
    expect(fxl.validateCell(invalidCell).val).toHaveProperty('error');
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
