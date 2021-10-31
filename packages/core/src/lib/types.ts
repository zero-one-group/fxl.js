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

export type Font = Partial<ExcelJS.Font>;

export type Alignment = Partial<ExcelJS.Alignment>;

export type HorizontalAlignment = ExcelJS.Alignment['horizontal'];

export type VerticalAlignment = ExcelJS.Alignment['vertical'];

export interface Cell {
  value: Value;
  coord: Coord;
  style?: Style;
}

export type ValidCell = Opaque<'ValidCell', Cell>;

export type Monoid<T> = (arg: T) => T;
