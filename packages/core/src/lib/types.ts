import * as ExcelJS from 'exceljs';

type Opaque<K, T> = T & { __TYPE__: K };

export interface Error {
  error: string;
}

export type Value = ExcelJS.CellValue;

export interface Coord {
  row: number;
  col: number;
  sheet?: string;
}

export type ValidCoord = Opaque<'ValidCoord', Coord>;

export type Style = Partial<ExcelJS.Style>;

export interface Cell {
  value: Value;
  coord: Coord;
  style?: Style;
}

export type ValidCell = Opaque<'ValidCell', Cell>;
