import { Ok, Err, Result } from 'ts-results';

import * as t from './types';

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
