import * as ExcelJS from 'exceljs';

import * as t from './types';

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
    return { error: 'invalid coordinate range' };
  }
}

export function validateCell(cell: t.Cell): t.ValidCell | t.Error {
  const messages = [];
  const coordValidation = validateCoord(cell.coord);
  if (t.isError(coordValidation)) {
    messages.push(coordValidation);
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
): t.Cell {
  return {
    value: cell.value,
    coord: {
      row: rowIndex - 1,
      col: colIndex - 1,
      sheet: sheetName,
    },
    style: {},
  };
}

export async function readXlsx(fileName: string): Promise<t.Cell[]> {
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
