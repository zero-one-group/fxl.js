import { toCell } from './cells';
import * as t from './types';

/**
 * Returns a new Cell with modified sheet name.
 *
 * @param {string} sheetName
 * @returns {t.Monoid<t.Cell>}
 */
export function setSheet(sheetName: string): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const coord = { ...cell.coord, sheet: sheetName };
    return { ...cell, coord: coord };
  };
}

/**
 * Takes an array of candidate cell values and returns a row of Cells.
 *
 * @remarks
 * Defaults to the first row and no styling.
 *
 * @param {t.Value[]} values
 * @returns {t.Cell[]}
 */
export function rowToCells(values: t.Value[]): t.Cell[] {
  return values.map((value, index) => ({
    value: value,
    coord: { row: 0, col: index },
    style: {},
  }));
}

/**
 * Takes an array of candidate cell values and returns a column of Cells.
 *
 * @remarks
 * Defaults to the first column and no styling.
 *
 * @param {t.Value[]} values
 * @returns {t.Cell[]}
 */
export function colToCells(values: t.Value[]): t.Cell[] {
  return values.map((value, index) => ({
    value: value,
    coord: { row: index, col: 0 },
    style: {},
  }));
}

/**
 * Takes an array of keys and an array records containing the candidate cell
 * values associated to the input keys. Returns a table of Cells.
 *
 * @remarks
 * Defaults to the first row, first column and no styling.
 *
 * @example
 * ```ts
 * const table = fxl.recordsToCells(
 *   ['a', 'b'],
 *   [ { a: 1, b: 'x' }, { a: 2, b: 'y' } ]
 * );
 * ```
 *
 * @param {keys} keys
 * @param {t.Value[]} records
 * @returns {t.Cell[]}
 */
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

/**
 * Takes an array of arrays of candidate cell values, and returns a table of
 * Cells.
 *
 * @remarks
 * Defaults to the first row, first column and no styling.
 *
 * @param {t.Value[]][]} table
 * @returns {t.Cell[]}
 */
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

/**
 * Takes an array of cells and returns an array of arrays of cell values.
 *
 * @remarks
 * The returned array of arrays has a tabular format. Missing cells are
 * converted to `undefined`.
 *
 * @param {t.Cell[]} cells
 * @returns {t.Value[][]}
 */
export function cellsToTable(cells: t.Cell[]): t.Value[][] {
  const cellLookup: Record<string, t.Value> = {};
  cells.forEach((cell) => {
    const { row, col } = cell.coord;
    cellLookup[JSON.stringify({ row, col })] = cell.value;
  });

  return range(maxRow(cells) + 1).map((rowIndex) => {
    return range(maxCol(cells) + 1).map((colIndex) => {
      const coord = { row: rowIndex, col: colIndex };
      return cellLookup[JSON.stringify(coord)];
    });
  });
}

/**
 * Takes an array of cells and returns the maximum row index.
 *
 * @param {t.Cell[]} cells
 * @returns {number}
 */
export function maxRow(cells: t.Cell[]): number {
  if (cells.length == 0) {
    return -1;
  } else {
    const rowIndices = cells.map((cell) => cell.coord.row);
    return Math.max(...rowIndices);
  }
}

/**
 * Takes an array of cells and returns the maximum row index including merged coords.
 *
 * @param {t.Cell[]} cells
 * @returns {number}
 */
export function lowestRow(cells: t.Cell[]): number {
  if (cells.length == 0) {
    return -1;
  } else {
    const rowIndices = cells.map((cell) => {
      const coord = cell.coord;
      const height = 'height' in coord ? coord.height : 1;
      return coord.row + (height - 1);
    });
    return Math.max(...rowIndices);
  }
}

/**
 * Returns a function that shifts a cell down by `shift` rows.
 *
 * @param {number} shift
 * @returns {t.Monoid<t.Cell>}
 */
export function shiftDown(shift: number): t.Monoid<t.Cell> {
  return (cell) => {
    const newCoord = { row: cell.coord.row + shift, col: cell.coord.col };
    return { ...cell, coord: newCoord };
  };
}

/**
 * Returns a function that shifts a cell up by `shift` rows.
 *
 * @param {number} shift
 * @returns {t.Monoid<t.Cell>}
 */
export function shiftUp(shift: number): t.Monoid<t.Cell> {
  return shiftDown(-shift);
}

/**
 * Takes an array of cells and returns the maximum column index.
 *
 * @param {t.Cell[]} cells
 * @returns {number}
 */
export function maxCol(cells: t.Cell[]): number {
  if (cells.length == 0) {
    return -1;
  } else {
    const colIndices = cells.map((cell) => cell.coord.col);
    return Math.max(...colIndices);
  }
}

/**
 * Takes an array of cells and returns the maximum column index including merged coords.
 *
 * @param {t.Cell[]} cells
 * @returns {number}
 */
export function rightmostCol(cells: t.Cell[]): number {
  if (cells.length == 0) {
    return -1;
  } else {
    const colIndices = cells.map((cell) => {
      const coord = cell.coord;
      const width = 'width' in coord ? coord.width : 1;
      return coord.col + (width - 1);
    });
    return Math.max(...colIndices);
  }
}

/**
 * Returns a function that shifts a cell to the right by `shift` columns.
 *
 * @param {number} shift
 * @returns {t.Monoid<t.Cell>}
 */
export function shiftRight(shift: number): t.Monoid<t.Cell> {
  return (cell) => {
    const newCoord = { row: cell.coord.row, col: cell.coord.col + shift };
    return { ...cell, coord: newCoord };
  };
}

/**
 * Returns a function that shifts a cell to the left by `shift` columns.
 *
 * @param {number} shift
 * @returns {t.Monoid<t.Cell>}
 */
export function shiftLeft(shift: number): t.Monoid<t.Cell> {
  return shiftRight(-shift);
}

function concatBelowTwoGroups(left: t.Cell[], right: t.Cell[]): t.Cell[] {
  const shift = lowestRow(left) + 1;
  const shiftedRight = right.map((cell) => shiftDown(shift)(cell));
  return left.concat(shiftedRight);
}

/**
 * Takes in an array of groups of cells, and returns a combined group of cells
 * where the groups are stacked vertically from top to bottom.
 *
 * @param {t.Cell[][]} cellGroups
 * @returns {t.Cell[]}
 */
export function concatBelow(...cellGroups: t.Cell[][]): t.Cell[] {
  return cellGroups.reduce(concatBelowTwoGroups);
}

/**
 * Takes in a group of cells and returns the same group with padding underneath
 * by `numPad` rows.
 *
 * @param {t.Cell[][]} cellGroups
 * @returns {t.Cell[]}
 */
export function padBelow(numPad: number, cells: t.Cell[]): t.Cell[] {
  if (numPad == 0) {
    return cells;
  } else if (numPad < 0) {
    const padCell = shiftDown(-numPad - 1)(toCell(undefined));
    return concatBelow([padCell], cells);
  } else {
    const padCell = shiftDown(numPad - 1)(toCell(undefined));
    return concatBelow(cells, [padCell]);
  }
}

/**
 * Takes in a group of cells and returns the same group with padding above by
 * `numPad` rows.
 *
 * @param {t.Cell[][]} cellGroups
 * @returns {t.Cell[]}
 */
export function padAbove(numPad: number, cells: t.Cell[]): t.Cell[] {
  return padBelow(-numPad, cells);
}

function concatRightTwoGroups(left: t.Cell[], right: t.Cell[]): t.Cell[] {
  const numPad = rightmostCol(left) + 1;
  const shiftedRight = right.map((cell) => shiftRight(numPad)(cell));
  return left.concat(shiftedRight);
}

/**
 * Takes in an array of groups of cells, and returns a combined group of cells
 * where the groups are stacked horizontally from left to right.
 *
 * @param {t.Cell[][]} cellGroups
 * @returns {t.Cell[]}
 */
export function concatRight(...cellGroups: t.Cell[][]): t.Cell[] {
  return cellGroups.reduce(concatRightTwoGroups);
}

/**
 * Takes in a group of cells and returns the same group with padding to the
 * right by `numPad` columns.
 *
 * @param {t.Cell[][]} cellGroups
 * @returns {t.Cell[]}
 */
export function padRight(numPad: number, cells: t.Cell[]): t.Cell[] {
  if (numPad == 0) {
    return cells;
  } else if (numPad < 0) {
    const padCell = shiftRight(-numPad - 1)(toCell(undefined));
    return concatRight([padCell], cells);
  } else {
    const padCell = shiftRight(numPad - 1)(toCell(undefined));
    return concatRight(cells, [padCell]);
  }
}

/**
 * Takes in a group of cells and returns the same group with padding to the
 * left by `numPad` columns.
 *
 * @param {t.Cell[][]} cellGroups
 * @returns {t.Cell[]}
 */
export function padLeft(numPad: number, cells: t.Cell[]): t.Cell[] {
  return padRight(-numPad, cells);
}
