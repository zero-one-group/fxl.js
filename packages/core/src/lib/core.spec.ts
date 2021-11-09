import * as ExcelJS from 'exceljs';
import * as temp from 'temp';

import * as core from './core';
import * as utils from './test-utils';
import { toCell } from './cells';
import { validateCell } from './validation';

temp.track();

const XLSX_PATH = 'packages/core/src/data/dummy-spreadsheet.xlsx';

describe('basic reading and writing xlsx', () => {
  it('readXlsx should return valid cells', async () => {
    const result = await core.readXlsx(XLSX_PATH);
    const cells = utils.extractOk(result);
    expect(cells.length).toBe(23);
    expect(cells.map(validateCell).filter((x) => x.err)).toEqual([]);
  });

  it('readXlsx should fail gracefully', async () => {
    const result = await core.readXlsx('some/none/existent/path');
    expect(result.val).toHaveProperty('error');
  });

  it('writeXlsx should take in valid cells', async () => {
    const cell = toCell('abc');
    const style = { colWidth: 1, rowHeight: 1 };
    const cells = [
      { ...cell, style: style },
      { ...cell, coord: { row: 1, col: 0 }, style: style },
      { ...cell, coord: { row: 0, col: 1 }, style: style },
      {
        ...cell,
        coord: { row: 1, col: 1, sheet: 'abc' },
        style: style,
      },
    ];
    const tempFile = temp.openSync('excel-temp');
    await core.writeXlsx(cells, tempFile.path);
    const result = await core.readXlsx(tempFile.path);
    const loadedCells = utils.extractOk(result);
    expect(loadedCells.length).toBe(4);
    expect(loadedCells.map((x) => x.value)).toEqual([
      cell.value,
      cell.value,
      cell.value,
      cell.value,
    ]);
  });

  it('writeXlsx should fail gracefully', async () => {
    const cell = { ...toCell('abc'), coord: { row: -1, col: 0 } };
    const tempFile = temp.openSync('excel-temp');
    const result = await core.writeXlsx([cell], tempFile.path);
    const error = utils.extractSome(result);
    expect(error).toHaveProperty('error');
  });

  it('can write and read from binary', async () => {
    const cell = toCell('abc');
    const writeResult = await core.writeBinary([cell]);
    const xlsxBuffer = utils.extractOk(writeResult);
    const readResult = await core.readBinary(xlsxBuffer);
    const loadedCells = utils.extractOk(readResult);
    expect(loadedCells.map((x) => x.value)).toEqual([cell.value]);
  });

  it('binary functions should fail gracefully', async () => {
    const cell = { ...toCell('abc'), coord: { row: -1, col: 0 } };
    const writeResult = await core.writeBinary([cell]);
    expect(writeResult.err).toBe(true);

    const randomBuffer = new Uint16Array([1, 2, 3]) as ExcelJS.Buffer;
    const readResult = await core.readBinary(randomBuffer);
    expect(readResult.err).toBe(true);
  });
});

describe('cell style capture', () => {
  it('readXlsx shold capture style properties', async () => {
    const result = await core.readXlsx(XLSX_PATH);
    const cells = utils.extractOk(result);
    expect(cells.filter((x) => x?.style?.font?.bold).length).toBe(1);
  });

  it('write-then-read should preserve style (except for cell sizes)', async () => {
    const font = { name: 'Roboto', size: 13 };
    const style = { font: font, rowHeight: 100, colWidth: 12 };
    const cell = { ...toCell('abc-def'), style: style };
    const writeResult = await core.writeBinary([cell]);
    const readResult = await core.readBinary(utils.extractOk(writeResult));
    const loaded = utils.extractOk(readResult);
    expect(loaded.map((x) => x?.style?.font)).toEqual([font]);
    expect(loaded.map((x) => x?.style?.colWidth)).toEqual([undefined]);
    expect(loaded.map((x) => x?.style?.rowHeight)).toEqual([undefined]);
  });

  it('write-then-read without style should work', async () => {
    const cell = { value: 'abc', coord: { row: 1, col: 1 } };
    const writeResult = await core.writeBinary([cell]);
    const readResult = await core.readBinary(utils.extractOk(writeResult));
    const loaded = utils.extractOk(readResult);
    expect(loaded.map((x) => x?.style)).toEqual([{}]);
  });
});

describe('utility functions', () => {
  it('toCell should have sensible defaults', () => {
    const cellValue = 'abc-xyz';
    const cell = toCell(cellValue);
    expect(cell.value).toEqual(cellValue);
    expect(cell.coord).toEqual({ row: 0, col: 0 });
    expect(cell.style).toEqual({});
  });
});
