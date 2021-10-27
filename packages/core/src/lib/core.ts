import { Value, Cell } from './types';

export function toCell(value: Value): Cell {
  return {
    value: value,
    coord: { row: 0, col: 0 },
    style: {},
  };
}
