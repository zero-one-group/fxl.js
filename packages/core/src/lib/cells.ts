import * as t from './types';

/**
 * Takes a candidate cell value and returns a fxl Cell object.
 *
 * @remarks
 * Defaults to the first row, first column and no styling.
 *
 * @param {t.Value} value
 * @returns {t.Cell}
 */
export function toCell(value: t.Value): t.Cell {
  return {
    value: value,
    coord: { row: 0, col: 0 },
    style: {},
  };
}
