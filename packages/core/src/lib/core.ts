import * as ExcelJS from 'exceljs';
import { Ok, Err, Result, Option, Some, None } from 'ts-results';

import * as t from './types';

const DEFAULT_SHEET_NAME = 'Sheet 1';
const MAX_ROWS = Math.round(1e5);
const MAX_COLS = Math.round(1e4);

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
    style: cell.style,
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

function setCells(workbook: ExcelJS.Workbook, cells: t.ValidCell[]): void {
  cells.forEach((cell) => {
    const sheetName = cell.coord.sheet || DEFAULT_SHEET_NAME;
    const worksheet =
      workbook.getWorksheet(sheetName) || workbook.addWorksheet(sheetName);
    const excelCell = worksheet.getCell(cell.coord.row + 1, cell.coord.col + 1);
    excelCell.value = cell.value;
    excelCell.style = cell.style || {};
  });
}

function scanCellSizes(cells: t.Cell[]): [t.CellSizes, t.CellSizes] {
  const colWidths: t.CellSizes = new Map();
  const rowHeights: t.CellSizes = new Map();
  cells.forEach((cell) => {
    const sheetName = cell.coord.sheet || DEFAULT_SHEET_NAME;
    const { row: row, col: col } = cell.coord;
    const colWidth = cell.style?.colWidth;
    if (colWidth) {
      const sheetColWidths = colWidths.get(sheetName) || new Map();
      const thisColWidths = sheetColWidths.get(col) || [];
      thisColWidths.push(colWidth);
      sheetColWidths.set(col, thisColWidths);
      colWidths.set(sheetName, sheetColWidths);
    }
    const rowHeight = cell.style?.rowHeight;
    if (rowHeight) {
      const sheetRowHeights = rowHeights.get(sheetName) || new Map();
      const thisRowHeights = sheetRowHeights.get(row) || [];
      thisRowHeights.push(rowHeight);
      sheetRowHeights.set(col, thisRowHeights);
      rowHeights.set(sheetName, sheetRowHeights);
    }
  });
  return [colWidths, rowHeights];
}

function setCellSizes(workbook: ExcelJS.Workbook, cells: t.ValidCell[]): void {
  const [colWidths, rowHeights] = scanCellSizes(cells);
  for (const [sheetName, sheetColWidths] of colWidths.entries()) {
    const worksheet = workbook.getWorksheet(sheetName);
    for (const [colIndex, thisColWidths] of sheetColWidths.entries()) {
      worksheet.columns[colIndex]['width'] = Math.max(...thisColWidths);
    }
  }
  for (const [sheetName, sheetRowHeights] of rowHeights.entries()) {
    const worksheet = workbook.getWorksheet(sheetName);
    for (const [rowIndex, thisRowHeights] of sheetRowHeights.entries()) {
      worksheet.getRow(rowIndex).height = Math.max(...thisRowHeights);
    }
  }
}

function toExcelWorkbook(cells: t.Cell[]): Result<ExcelJS.Workbook, t.Error> {
  const [validCells, errors] = splitErrors(cells.map(validateCell));
  if (errors.length == 0) {
    const workbook = new ExcelJS.Workbook();
    setCells(workbook, validCells); // TODO: return scan results here
    setCellSizes(workbook, validCells);
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
