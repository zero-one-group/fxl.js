import * as ExcelJS from 'exceljs';
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

describe('basic coordinate helper functions', () => {
  const values = ['a', 'b', 123, 789];
  const records = [
    { a: 1, b: 2 },
    { a: 3, b: 4 },
  ];
  const table = [
    ['x', 'y'],
    [true, false],
  ];

  it('rowToCells should work properly', () => {
    const cells = fxl.rowToCells(values);
    expect(cells.map(fxl.validateCell).filter((x) => x.err)).toEqual([]);
    expect(cells.map((x) => x.value)).toEqual(values);
    const rangeArray = [...Array(values.length).keys()];
    expect(cells.map((x) => x.coord.col)).toEqual(rangeArray);
    expect(cells.map((x) => x.coord.row)).toEqual(Array(values.length).fill(0));
  });

  it('colToCells should work properly', () => {
    const cells = fxl.colToCells(values);
    expect(cells.map(fxl.validateCell).filter((x) => x.err)).toEqual([]);
    expect(cells.map((x) => x.value)).toEqual(values);
    const rangeArray = [...Array(values.length).keys()];
    expect(cells.map((x) => x.coord.row)).toEqual(rangeArray);
    expect(cells.map((x) => x.coord.col)).toEqual(Array(values.length).fill(0));
  });

  it('recordToCells should work properly', () => {
    const cells = fxl.recordsToCells(['a', 'b'], records);
    expect(cells.map(fxl.validateCell).filter((x) => x.err)).toEqual([]);
    const firstRow = cells.filter((x) => x.coord.row == 0).map((x) => x.value);
    expect(firstRow).toEqual([1, 2]);
    const secondCol = cells.filter((x) => x.coord.col == 1).map((x) => x.value);
    expect(secondCol).toEqual([2, 4]);
  });

  it('tableToCells should work properly', () => {
    const cells = fxl.tableToCells(table);
    expect(cells.map(fxl.validateCell).filter((x) => x.err)).toEqual([]);
    const firstRow = cells.filter((x) => x.coord.row == 0).map((x) => x.value);
    expect(firstRow).toEqual(['x', 'y']);
    const secondCol = cells.filter((x) => x.coord.col == 1).map((x) => x.value);
    expect(secondCol).toEqual(['y', false]);
  });
});

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

  it('can write and read from binary', async () => {
    const cell = fxl.toCell('abc');
    const writeResult = await fxl.writeBinary([cell]);
    const xlsxBuffer = extractOk(writeResult);
    const readResult = await fxl.readBinary(xlsxBuffer);
    const loadedCells = extractOk(readResult);
    expect(loadedCells.map((x) => x.value)).toEqual([cell.value]);
  });

  it('binary functions should fail gracefully', async () => {
    const cell = { ...fxl.toCell('abc'), coord: { row: -1, col: 0 } };
    const writeResult = await fxl.writeBinary([cell]);
    expect(writeResult.err).toBe(true);

    const randomBuffer = new Uint16Array([1, 2, 3]) as ExcelJS.Buffer;
    const readResult = await fxl.readBinary(randomBuffer);
    expect(readResult.err).toBe(true);
  });
});

describe('validation functions', () => {
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

describe('utility functions', () => {
  it('toCell should have sensible defaults', () => {
    const cellValue = 'abc-xyz';
    const cell = fxl.toCell(cellValue);
    expect(cell.value).toEqual(cellValue);
    expect(cell.coord).toEqual({ row: 0, col: 0 });
    expect(cell.style).toEqual({});
  });
});
