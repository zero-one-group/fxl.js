import * as ExcelJS from 'exceljs';
import { Ok, Err, Result, Option, Some, None } from 'ts-results';

import * as t from './types';
import { concatErrors, splitErrors, validateCell } from './validation';

const DEFAULT_SHEET_NAME = 'Sheet 1';

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

/**
 * Reads an XLSX file and returns an array of fxl cells if succsessful.
 *
 * @remarks
 * The result is wrapped in ts-results' Result object:
 * {@link https://github.com/vultix/ts-results#result-example}
 *
 * @param {string} fileName
 * @returns {Promise<Result<t.ValidCell[], t.Error>>}
 */
export async function readXlsx(
  fileName: string
): Promise<Result<t.ValidCell[], t.Error>> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(fileName);
    const cells = readExcelWorkbook(workbook);
    return Ok(cells);
  } catch (exception) {
    // TODO: exception should be of type unknown
    return Err({ error: (exception as Error).message });
  }
}

/**
 * Reads an ExcelJS buffer and returns an array of fxl cells if succsessful.
 *
 * @remarks
 * The result is wrapped in ts-results' Result object:
 * {@link https://github.com/vultix/ts-results#result-example}
 *
 * @param {ExcelJS.Buffer} binary
 * @returns {Promise<Result<t.ValidCell[], t.Error>>}
 */
export async function readBinary(
  binary: ExcelJS.Buffer
): Promise<Result<t.ValidCell[], t.Error>> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(binary);
    const cells = readExcelWorkbook(workbook);
    return Ok(cells);
  } catch (exception) {
    // TODO: exception should be of type unknown
    return Err({ error: (exception as Error).message });
  }
}

function setCells(workbook: ExcelJS.Workbook, cells: t.ValidCell[]): void {
  cells.forEach((cell) => {
    const coord = cell.coord;
    const sheetName = cell.coord.sheet ?? DEFAULT_SHEET_NAME;
    const worksheet =
      workbook.getWorksheet(sheetName) ?? workbook.addWorksheet(sheetName);

    if ('height' in coord || 'width' in coord) {
      worksheet.mergeCells(
        coord.row,
        coord.col,
        coord.row + coord.height - 1,
        coord.col + coord.width - 1
      );
    }

    const excelCell = worksheet.getCell(coord.row + 1, coord.col + 1);
    excelCell.value = cell.value;
    excelCell.style = cell.style ?? {};
  });
}

function newSizeMap(): Map<number, number[]> {
  return new Map();
}

function scanCellSizes(cells: t.Cell[]): [t.CellSizes, t.CellSizes] {
  const colWidths: t.CellSizes = new Map();
  const rowHeights: t.CellSizes = new Map();
  cells.forEach((cell) => {
    const sheetName = cell.coord.sheet ?? DEFAULT_SHEET_NAME;
    const { row: row, col: col } = cell.coord;
    const colWidth = cell.style?.colWidth;
    if (colWidth) {
      const sheetColWidths = colWidths.get(sheetName) ?? newSizeMap();
      const thisColWidths = sheetColWidths.get(col) ?? [];
      thisColWidths.push(colWidth);
      sheetColWidths.set(col, thisColWidths);
      colWidths.set(sheetName, sheetColWidths);
    }
    const rowHeight = cell.style?.rowHeight;
    if (rowHeight) {
      const sheetRowHeights = rowHeights.get(sheetName) ?? newSizeMap();
      const thisRowHeights = sheetRowHeights.get(row) ?? [];
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
    setCells(workbook, validCells);
    setCellSizes(workbook, validCells);
    return Ok(workbook);
  } else {
    return Err(concatErrors(errors));
  }
}

/**
 * Writes a group of fxl cells into an XLSX file. Returns an optional error.
 *
 * @remarks
 * The result is wrapped in ts-results' Option object:
 * {@link https://github.com/vultix/ts-results#option-example}
 *
 * @param {t.Cell[]} cells
 * @param {string} fileNme
 * @returns {Promise<Option<t.Error>>>}
 */
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

/**
 * Converts a group of fxl cells into an ExcelJS buffer if succsessful.
 *
 * @remarks
 * The result is wrapped in ts-results' Result object:
 * {@link https://github.com/vultix/ts-results#result-example}
 *
 * @param {t.Cell[]} cells
 * @returns {Promise<Result<ExcelJS.Buffer, t.Error>>}
 */
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
