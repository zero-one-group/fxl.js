import { toCell } from './cells';
import * as t from './types';

export function setSheet(sheetName: string): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const coord = { ...cell.coord, sheet: sheetName };
    return { ...cell, coord: coord };
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

export function padBelow(shift: number, cells: t.Cell[]): t.Cell[] {
  if (shift == 0) {
    return cells;
  } else if (shift < 0) {
    const padCell = shiftDown(-shift - 1, toCell(undefined));
    return concatBelow([padCell], cells);
  } else {
    const padCell = shiftDown(shift - 1, toCell(undefined));
    return concatBelow(cells, [padCell]);
  }
}

export function padAbove(shift: number, cells: t.Cell[]): t.Cell[] {
  return padBelow(-shift, cells);
}

function concatRightTwoGroups(left: t.Cell[], right: t.Cell[]): t.Cell[] {
  const shift = maxCol(left) + 1;
  const shiftedRight = right.map((cell) => shiftRight(shift, cell));
  return left.concat(shiftedRight);
}

export function concatRight(...cellGroups: t.Cell[][]): t.Cell[] {
  return cellGroups.reduce(concatRightTwoGroups);
}

export function padRight(shift: number, cells: t.Cell[]): t.Cell[] {
  if (shift == 0) {
    return cells;
  } else if (shift < 0) {
    const padCell = shiftRight(-shift - 1, toCell(undefined));
    return concatRight([padCell], cells);
  } else {
    const padCell = shiftRight(shift - 1, toCell(undefined));
    return concatRight(cells, [padCell]);
  }
}

export function padLeft(shift: number, cells: t.Cell[]): t.Cell[] {
  return padRight(-shift, cells);
}
