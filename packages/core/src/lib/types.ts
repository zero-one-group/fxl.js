export type Value = string | number | boolean;

export interface Coord {
  row: number;
  col: number;
  sheet?: string;
}

export type Style = Record<string, unknown>;

export interface Cell {
  value: Value;
  coord: Coord;
  style: Style;
}
