import { Ok, Err, Result } from 'ts-results';

import * as t from './types';

const MAX_ROWS = Math.round(1e5);
const MAX_COLS = Math.round(1e4);

function toError(key: string, cell: t.Cell): Err<t.Error> {
  const prettyCell = JSON.stringify(cell, null, 2);
  return Err({ error: `invalid ${key} in ${prettyCell}` });
}

export function validateCoord(cell: t.Cell): Result<t.Cell, t.Error> {
  if (
    cell.coord.row >= 0 &&
    cell.coord.row <= MAX_ROWS &&
    cell.coord.col >= 0 &&
    cell.coord.col <= MAX_COLS
  ) {
    return Ok(cell);
  } else {
    return toError('coordinate', cell);
  }
}

function isValidArgb(maybeHex: string | undefined): boolean {
  if (maybeHex == undefined) {
    return true;
  } else {
    const lowered = maybeHex.toLowerCase();
    const parsed = parseInt(lowered, 16).toString(16).padStart(8, '0');
    return parsed === lowered && maybeHex.length == 8;
  }
}

export function validateFontColor(cell: t.Cell): Result<t.Cell, t.Error> {
  const argb = cell.style?.font?.color?.argb;
  if (isValidArgb(argb)) {
    return Ok(cell);
  } else {
    return toError('font color', cell);
  }
}

export function validateFillColors(cell: t.Cell): Result<t.Cell, t.Error> {
  const fill = cell.style?.fill;
  if (fill == undefined) {
    return Ok(cell);
  } else if (t.isFillPattern(fill)) {
    if (isValidArgb(fill.fgColor?.argb) && isValidArgb(fill.bgColor?.argb)) {
      return Ok(cell);
    } else {
      return toError('fill colors', cell);
    }
  } else {
    return Ok(cell);
  }
}

export function validateBorderColors(cell: t.Cell): Result<t.Cell, t.Error> {
  const borders = [
    cell.style?.border?.top?.color?.argb,
    cell.style?.border?.right?.color?.argb,
    cell.style?.border?.bottom?.color?.argb,
    cell.style?.border?.left?.color?.argb,
  ];
  if (borders.every(isValidArgb)) {
    return Ok(cell);
  } else {
    return toError('border color', cell);
  }
}

export function validateFontSize(cell: t.Cell): Result<t.Cell, t.Error> {
  const size = cell.style?.font?.size;
  if (size == undefined || size > 0) {
    return Ok(cell);
  } else {
    return toError('font size', cell);
  }
}

export function validateCellSize(cell: t.Cell): Result<t.Cell, t.Error> {
  const rowHeight = cell.style?.rowHeight;
  const colWidth = cell.style?.colWidth;
  const validHeight = rowHeight == undefined || rowHeight > 0;
  const validWidth = colWidth == undefined || colWidth > 0;
  if (validHeight && validWidth) {
    return Ok(cell);
  } else {
    return toError('row height/col width', cell);
  }
}

export function validateCell(cell: t.Cell): Result<t.ValidCell, t.Error> {
  const validationResults = [
    validateCoord,
    validateFontColor,
    validateBorderColors,
    validateFillColors,
    validateFontSize,
    validateCellSize,
  ].map((fn) => fn(cell));
  const [, errors] = splitErrors(validationResults);
  if (errors.length == 0) {
    return Ok(cell as t.ValidCell);
  } else {
    return Err(concatErrors(errors));
  }
}

export function concatErrors(errors: t.Error[]): t.Error {
  return { error: errors.map((x) => x.error).join('\n') };
}

export function splitErrors<T, U>(results: Result<T, U>[]): [T[], U[]] {
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
