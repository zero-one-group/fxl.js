import * as t from './types';

// TODO: handle incorrect hexes or make it type safe
// TODO: expand color shortcuts
export const COLOR_ARGBS: Record<string, string> = {
  red: 'FFFF0000',
  blue: 'FF0000FF',
  black: 'FF000000',
  white: 'FFFFFFFF',
};

export function setNumFmt(numFmt: string): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const style = { ...cell.style, numFmt: numFmt };
    return { ...cell, style: style };
  };
}

export function toColor(color: string): t.Color {
  return { argb: COLOR_ARGBS[color] || color };
}

///////////////////////////////////////////////////////////////////////////////
// Fill Shortcuts
///////////////////////////////////////////////////////////////////////////////
export const DEFAULT_FILL: t.Fill = { type: 'pattern', pattern: 'none' };

export function setFill(fill: t.Fill): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const style = { ...cell.style, fill: fill };
    return { ...cell, style: style };
  };
}

export function toFill(
  pattern: t.FillPatterns,
  fgColor: string,
  bgColor: string
): t.Fill {
  return {
    type: 'pattern',
    pattern: pattern,
    fgColor: toColor(fgColor),
    bgColor: toColor(bgColor),
  };
}

export function setSolidFg(color: string): t.Monoid<t.Cell> {
  return setFill({
    type: 'pattern',
    pattern: 'solid',
    fgColor: toColor(color),
  });
}

export function setSolidBg(color: string): t.Monoid<t.Cell> {
  return setFill({
    type: 'pattern',
    pattern: 'solid',
    bgColor: toColor(color),
  });
}

///////////////////////////////////////////////////////////////////////////////
// Border Shortcuts
///////////////////////////////////////////////////////////////////////////////
function getBorders(cell: t.Cell): t.Borders {
  return cell.style?.border || {};
}

export function setBorders(borders: t.Borders): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const style = { ...cell.style, border: borders };
    return { ...cell, style: style };
  };
}

export function setBorder(
  side: 'top' | 'right' | 'bottom' | 'left',
  border: t.Border
): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const borders = { ...getBorders(cell), [side]: border };
    return setBorders(borders)(cell);
  };
}

export function toBorder(style: t.BorderStyle, color: string): t.Border {
  return { style: style, color: toColor(color) };
}

///////////////////////////////////////////////////////////////////////////////
// Alignment Shortcuts
///////////////////////////////////////////////////////////////////////////////
function getAlignment(cell: t.Cell): t.Alignment {
  return cell.style?.alignment || {};
}

export function setAlignment(alignment: t.Alignment): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const style = { ...cell.style, alignment: alignment };
    return { ...cell, style: style };
  };
}

export function setHorizontalAlignement(
  horizontal: t.HorizontalAlignment
): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const alignment = { ...getAlignment(cell), horizontal: horizontal };
    return setAlignment(alignment)(cell);
  };
}

export function setVerticalAlignement(
  vertical: t.VerticalAlignment
): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const alignment = { ...getAlignment(cell), vertical: vertical };
    return setAlignment(alignment)(cell);
  };
}

export function setWrapText(wrapText: boolean): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const alignment = { ...getAlignment(cell), wrapText: wrapText };
    return setAlignment(alignment)(cell);
  };
}

///////////////////////////////////////////////////////////////////////////////
// Font Shortcuts
///////////////////////////////////////////////////////////////////////////////
function getFont(cell: t.Cell): t.Font {
  return cell.style?.font || {};
}

export function setFont(font: t.Font): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const style = { ...cell.style, font: font };
    return { ...cell, style: style };
  };
}

export function setBold(bold: boolean): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const font = { ...getFont(cell), bold: bold };
    return setFont(font)(cell);
  };
}

export function setItalic(italic: boolean): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const font = { ...getFont(cell), italic: italic };
    return setFont(font)(cell);
  };
}

export function setUnderline(underline: boolean): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const font = { ...getFont(cell), underline: underline };
    return setFont(font)(cell);
  };
}

export function setStrike(strike: boolean): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const font = { ...getFont(cell), strike: strike };
    return setFont(font)(cell);
  };
}

export function setFontName(fontName: string): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const font = { ...getFont(cell), name: fontName };
    return setFont(font)(cell);
  };
}

export function setFontSize(fontSize: number): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const font = { ...getFont(cell), size: fontSize };
    return setFont(font)(cell);
  };
}

export function setFontColor(fontColor: string): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const color = { argb: fontColor };
    const font = { ...getFont(cell), color: color };
    return setFont(font)(cell);
  };
}
