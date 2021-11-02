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

export interface Style extends Partial<ExcelJS.Style> {
  colWidth?: cellSize;
  rowHeight?: cellSize;
}

export type cellSize = number | 'auto';

export interface CellSizes {
  [sheetName: string]: { [index: number]: cellSize[] };
}

export type Font = Partial<ExcelJS.Font>;

export type Alignment = Partial<ExcelJS.Alignment>;

export type HorizontalAlignment = ExcelJS.Alignment['horizontal'];

export type VerticalAlignment = ExcelJS.Alignment['vertical'];

export type Borders = Partial<ExcelJS.Borders>;

export type Border = Partial<ExcelJS.Border>;

export type BorderStyle = Partial<ExcelJS.BorderStyle>;

export type Fill = ExcelJS.Fill;

export type FillPatterns = ExcelJS.FillPatterns;

export interface Color {
  argb: string;
}

export interface Cell {
  value: Value;
  coord: Coord;
  style?: Style;
}

export type ValidCell = Opaque<'ValidCell', Cell>;

export type Monoid<T> = (arg: T) => T;
