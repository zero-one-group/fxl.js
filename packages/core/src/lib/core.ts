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

function toFxl(
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

export async function readXlsx(
  fileName: string
): Promise<Result<t.ValidCell[], t.Error>> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(fileName);
    const cells = [];
    workbook.eachSheet((worksheet) => {
      worksheet.eachRow((row, rowIndex) => {
        row.eachCell((cell, colIndex) => {
          cells.push(toFxl(cell, rowIndex, colIndex, worksheet.name));
        });
      });
    });
    return Ok(cells);
  } catch (exception) {
    return Err({ error: exception.message });
  }
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
  const [validCells, errors] = splitErrors(cells.map(validateCell));
  if (errors.length == 0) {
    await validatedWriteXlsx(validCells, fileName);
    return None;
  } else {
    return Some(concatErrors(errors));
  }
}
