import * as t from './types';

// TODO: setBorders, setTopBorder, setRightBorder, setBottomBorder, setLeftBorder
// TODO: setFills, setFgFill, setBgFill
// TODO: color shortcuts

export function setNumFmt(numFmt: string): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const style = { ...cell.style, numFmt: numFmt };
    return { ...cell, style: style };
  };
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
