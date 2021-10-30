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

describe('cell style capture', () => {
  it('readXlsx shold capture style properties', async () => {
    const result = await fxl.readXlsx(XLSX_PATH);
    const cells = extractOk(result);
    expect(cells.filter((x) => x?.style?.font?.bold).length).toBe(1);
  });

  it('read-then-right should preserve style', async () => {
    const font = { name: 'Roboto', size: 13 };
    const cell = { ...fxl.toCell('abc'), style: { font: font } };
    const writeResult = await fxl.writeBinary([cell]);
    const readResult = await fxl.readBinary(extractOk(writeResult));
    const loaded = extractOk(readResult);
    expect(loaded.map((x) => x?.style?.font)).toEqual([font]);
  });

  it('read-then-right without style should work', async () => {
    const cell = { value: 'abc', coord: { row: 1, col: 1 } };
    const writeResult = await fxl.writeBinary([cell]);
    const readResult = await fxl.readBinary(extractOk(writeResult));
    const loaded = extractOk(readResult);
    expect(loaded.map((x) => x?.style)).toEqual([{}]);
  });
});

describe('basic coordinate helper functions', () => {
  const table = fxl.tableToCells([
    ['a', 'b'],
    ['x', 'y'],
  ]);
  const column = fxl.colToCells([undefined, true, false]);
  const row = fxl.rowToCells([1, undefined, 3]);

  it('concatBelow should work properly', () => {
    const cells = fxl.concatBelow(table, row);
    const outputTable = fxl.cellsToTable(cells);
    expect(outputTable).toEqual([
      ['a', 'b', undefined],
      ['x', 'y', undefined],
      [1, undefined, 3],
    ]);
  });

  it('concatRight should work properly', () => {
    const cells = fxl.concatRight(table, column);
    const outputTable = fxl.cellsToTable(cells);
    expect(outputTable).toEqual([
      ['a', 'b', undefined],
      ['x', 'y', true],
      [undefined, undefined, false],
    ]);
  });

  it('maxRow and maxCol should work properly', () => {
    expect(fxl.maxRow(table)).toBe(1);
    expect(fxl.maxCol(table)).toBe(1);
    expect(fxl.maxRow(column)).toBe(2);
    expect(fxl.maxCol(column)).toBe(0);
    expect(fxl.maxRow(row)).toBe(0);
    expect(fxl.maxCol(row)).toBe(2);
    expect(fxl.maxRow([])).toBe(-1);
    expect(fxl.maxCol([])).toBe(-1);
  });

  it('shift functions should work properly ', () => {
    const shiftedUp = table.map((x) => fxl.shiftUp(10, x));
    expect(fxl.maxRow(shiftedUp)).toBe(-9);
    expect(fxl.maxCol(shiftedUp)).toBe(1);
    const shiftedLeft = table.map((x) => fxl.shiftLeft(5, x));
    expect(fxl.maxRow(shiftedLeft)).toBe(1);
    expect(fxl.maxCol(shiftedLeft)).toBe(-4);
  });

  it('pad functions should work properly ', () => {
    const paddedBelow = fxl.padBelow(2, row);
    expect(fxl.cellsToTable(paddedBelow)).toEqual([
      [1, undefined, 3],
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
    ]);
    const paddedBelowZero = fxl.padBelow(0, row);
    expect(fxl.cellsToTable(paddedBelowZero)).toEqual([[1, undefined, 3]]);
    const paddedBelowNeg = fxl.padBelow(-1, column);
    expect(fxl.cellsToTable(paddedBelowNeg)).toEqual([
      [undefined],
      [undefined],
      [true],
      [false],
    ]);
    const paddedAbove = fxl.padAbove(2, column);
    expect(fxl.cellsToTable(paddedAbove)).toEqual([
      [undefined],
      [undefined],
      [undefined],
      [true],
      [false],
    ]);

    const paddedRight = fxl.padRight(2, table);
    expect(fxl.cellsToTable(paddedRight)).toEqual([
      ['a', 'b', undefined, undefined],
      ['x', 'y', undefined, undefined],
    ]);
    const paddedRightZero = fxl.padRight(0, table);
    expect(fxl.cellsToTable(paddedRightZero)).toEqual([
      ['a', 'b'],
      ['x', 'y'],
    ]);
    const paddedRightNeg = fxl.padRight(-3, table);
    expect(fxl.cellsToTable(paddedRightNeg)).toEqual([
      [undefined, undefined, undefined, 'a', 'b'],
      [undefined, undefined, undefined, 'x', 'y'],
    ]);
    const paddedLeft = fxl.padLeft(2, table);
    expect(fxl.cellsToTable(paddedLeft)).toEqual([
      [undefined, undefined, 'a', 'b'],
      [undefined, undefined, 'x', 'y'],
    ]);
  });
});

describe('basic cell creation helper functions', () => {
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

  it('cellsToTable should work properly', () => {
    const cells = fxl.tableToCells(table);
    expect(table).toEqual(fxl.cellsToTable(cells));
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
