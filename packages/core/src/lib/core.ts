import * as ExcelJS from 'exceljs';

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

export function validateCoord(coord: t.Coord): t.ValidCoord | t.Error {
  if (
    coord.row >= 0 &&
    coord.row <= MAX_ROWS &&
    coord.col >= 0 &&
    coord.col <= MAX_COLS
  ) {
    return coord as t.ValidCoord;
  } else {
    return {
      error: `invalid coordinate range in ${JSON.stringify(coord, null, 2)}`,
    };
  }
}

export function validateCell(cell: t.Cell): t.ValidCell | t.Error {
  const messages = [];
  const coordValidation = validateCoord(cell.coord);
  if (t.isError(coordValidation)) {
    messages.push(coordValidation.error);
  }
  if (messages.length == 0) {
    return cell as t.ValidCell;
  } else {
    return { error: messages.join('\n') };
  }
}

function toFxlCell(
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

export async function readXlsx(fileName: string): Promise<t.ValidCell[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(fileName);
  const cells = [];
  workbook.eachSheet((worksheet) => {
    worksheet.eachRow((row, rowIndex) => {
      row.eachCell((cell, colIndex) => {
        cells.push(toFxlCell(cell, rowIndex, colIndex, worksheet.name));
      });
    });
  });
  return cells;
}

async function validatedWriteXlsx(
  cells: t.ValidCell[],
  fileName: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  cells.forEach((cell) => {
    const sheetName = cell.coord.sheet || DEFAULT_SHEET_NAME;
    const worksheet =
      workbook.getWorksheet(sheetName) || workbook.addWorksheet(sheetName);
    const excelCell = worksheet.getCell(cell.coord.row + 1, cell.coord.col + 1);
    excelCell.value = cell.value;
  });
  await workbook.xlsx.writeFile(fileName);
}

function concatErrors(errors: t.Error[]): t.Error {
  return { error: errors.map((x) => x.error).join('\n') };
}

function splitErrors<T>(results: (T | t.Error)[]): [T[], t.Error[]] {
  const values: T[] = [];
  const errors: t.Error[] = [];
  results.forEach((result) => {
    if (t.isError(result)) {
      errors.push(result);
    } else {
      values.push(result);
    }
  });
  return [values, errors];
}

export async function writeXlsx(
  cells: t.Cell[],
  fileName: string
): Promise<void | t.Error> {
  const [validCells, errors] = splitErrors(cells.map(validateCell));
  if (errors.length == 0) {
    await validatedWriteXlsx(validCells, fileName);
  } else {
    return concatErrors(errors);
  }
}
