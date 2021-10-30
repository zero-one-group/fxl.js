import * as ExcelJS from 'exceljs';
import { Ok, Err, Result, Option, Some, None } from 'ts-results';

import * as t from './types';

const DEFAULT_SHEET_NAME = 'Sheet 1';
const MAX_ROWS = Math.round(1e5);
const MAX_COLS = Math.round(1e4);

export function toCell(value: t.Value): t.Cell {
  return {
    value: value,
    coord: { row: 0, col: 0 },
    style: {},
  };
}

export function rowToCells(values: t.Value[]): t.Cell[] {
  return values.map((value, index) => ({
    value: value,
    coord: { row: 0, col: index },
    style: {},
  }));
}

export function colToCells(values: t.Value[]): t.Cell[] {
  return values.map((value, index) => ({
    value: value,
    coord: { row: index, col: 0 },
    style: {},
  }));
}

export function recordsToCells(
  keys: string[],
  records: Record<string, t.Value>[]
): t.Cell[] {
  return keys.flatMap((key, colIndex) =>
    records.map((record, rowIndex) => ({
      value: record[key],
      coord: { row: rowIndex, col: colIndex },
      style: {},
    }))
  );
}

export function tableToCells(table: t.Value[][]): t.Cell[] {
  return table.flatMap((row, rowIndex) =>
    row.map((value, colIndex) => ({
      value: value,
      coord: { row: rowIndex, col: colIndex },
      style: {},
    }))
  );
}

function range(num: number): number[] {
  return [...Array(num).keys()];
}

export function cellsToTable(cells: t.Cell[]): t.Value[][] {
  const cellLookup: Record<string, t.Value> = {};
  cells.forEach((cell) => {
    cellLookup[JSON.stringify(cell.coord)] = cell.value;
  });

  return range(maxRow(cells) + 1).map((rowIndex) => {
    return range(maxCol(cells) + 1).map((colIndex) => {
      const coord = { row: rowIndex, col: colIndex };
      return cellLookup[JSON.stringify(coord)];
    });
  });
}

export function maxRow(cells: t.Cell[]): number {
  if (cells.length == 0) {
    return -1;
  } else {
    const rowIndices = cells.map((cell) => cell.coord.row);
    return Math.max(...rowIndices);
  }
}

export function shiftDown(shift: number, cell: t.Cell): t.Cell {
  const newCoord = { row: cell.coord.row + shift, col: cell.coord.col };
  return { ...cell, coord: newCoord };
}

export function shiftUp(shift: number, cell: t.Cell): t.Cell {
  return shiftDown(-shift, cell);
}

export function maxCol(cells: t.Cell[]): number {
  if (cells.length == 0) {
    return -1;
  } else {
    const colIndices = cells.map((cell) => cell.coord.col);
    return Math.max(...colIndices);
  }
}

export function shiftRight(shift: number, cell: t.Cell): t.Cell {
  const newCoord = { row: cell.coord.row, col: cell.coord.col + shift };
  return { ...cell, coord: newCoord };
}

export function shiftLeft(shift: number, cell: t.Cell): t.Cell {
  return shiftRight(-shift, cell);
}

function concatBelowTwoGroups(left: t.Cell[], right: t.Cell[]): t.Cell[] {
  const shift = maxRow(left) + 1;
  const shiftedRight = right.map((cell) => shiftDown(shift, cell));
  return left.concat(shiftedRight);
}

export function concatBelow(...cellGroups: t.Cell[][]): t.Cell[] {
  return cellGroups.reduce(concatBelowTwoGroups);
}

function concatRightTwoGroups(left: t.Cell[], right: t.Cell[]): t.Cell[] {
  const shift = maxCol(left) + 1;
  const shiftedRight = right.map((cell) => shiftRight(shift, cell));
  return left.concat(shiftedRight);
}

export function concatRight(...cellGroups: t.Cell[][]): t.Cell[] {
  return cellGroups.reduce(concatRightTwoGroups);
}

export function validateCoord(coord: t.Coord): Result<t.ValidCoord, t.Error> {
  if (
    coord.row >= 0 &&
    coord.row <= MAX_ROWS &&
    coord.col >= 0 &&
    coord.col <= MAX_COLS
  ) {
    return Ok(coord as t.ValidCoord);
  } else {
    const prettyCoord = JSON.stringify(coord, null, 2);
    return Err({ error: `invalid coordinate range in ${prettyCoord}` });
  }
}

export function validateCell(cell: t.Cell): Result<t.ValidCell, t.Error> {
  const errors = [];
  const validated = validateCoord(cell.coord);
  if (validated.err) {
    errors.push(validated.val);
  }
  if (errors.length == 0) {
    return Ok(cell as t.ValidCell);
  } else {
    return Err(concatErrors(errors));
  }
}

function readExcelCell(
  cell: ExcelJS.Cell,
  rowIndex: number,
  colIndex: number,
  sheetName: string
): t.ValidCell {
  return {
    value: cell.value,
    coord: {
      row: rowIndex - 1,
      col: colIndex - 1,
      sheet: sheetName,
    },
    style: {},
  } as t.ValidCell;
}

function readExcelWorkbook(workbook: ExcelJS.Workbook): t.ValidCell[] {
  const cells: t.ValidCell[] = [];
  workbook.eachSheet((worksheet) => {
    worksheet.eachRow((row, rowIndex) => {
      row.eachCell((cell, colIndex) => {
        cells.push(readExcelCell(cell, rowIndex, colIndex, worksheet.name));
      });
    });
  });
  return cells;
}

export async function readXlsx(
  fileName: string
): Promise<Result<t.ValidCell[], t.Error>> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(fileName);
    const cells = readExcelWorkbook(workbook);
    return Ok(cells);
  } catch (exception) {
    return Err({ error: exception.message });
  }
}

export async function readBinary(
  binary: ExcelJS.Buffer
): Promise<Result<t.ValidCell[], t.Error>> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(binary);
    const cells = readExcelWorkbook(workbook);
    return Ok(cells);
  } catch (exception) {
    return Err({ error: exception.message });
  }
}

function toExcelWorkbook(cells: t.Cell[]): Result<ExcelJS.Workbook, t.Error> {
  const [validCells, errors] = splitErrors(cells.map(validateCell));
  if (errors.length == 0) {
    const workbook = new ExcelJS.Workbook();
    validCells.forEach((cell) => {
      const sheetName = cell.coord.sheet || DEFAULT_SHEET_NAME;
      const worksheet =
        workbook.getWorksheet(sheetName) || workbook.addWorksheet(sheetName);
      const excelCell = worksheet.getCell(
        cell.coord.row + 1,
        cell.coord.col + 1
      );
      excelCell.value = cell.value;
    });
    return Ok(workbook);
  } else {
    return Err(concatErrors(errors));
  }
}

function concatErrors(errors: t.Error[]): t.Error {
  return { error: errors.map((x) => x.error).join('\n') };
}

function splitErrors<T, U>(results: Result<T, U>[]): [T[], U[]] {
  const values: T[] = [];
  const errors: U[] = [];
  results.forEach((result) => {
    if (result.ok) {
      values.push(result.val);
    }
    if (result.err) {
      errors.push(result.val);
    }
  });
  return [values, errors];
}

export async function writeXlsx(
  cells: t.Cell[],
  fileName: string
): Promise<Option<t.Error>> {
  const workbook = toExcelWorkbook(cells);
  if (workbook.ok) {
    await workbook.val.xlsx.writeFile(fileName);
    return None;
  } else {
    return Some(workbook.val);
  }
}

export async function writeBinary(
  cells: t.Cell[]
): Promise<Result<ExcelJS.Buffer, t.Error>> {
  const workbook = toExcelWorkbook(cells);
  if (workbook.ok) {
    const binary = await workbook.val.xlsx.writeBuffer();
    return Ok(binary);
  } else {
    return Err(workbook.val);
  }
}
