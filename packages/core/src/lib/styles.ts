import * as t from './types';

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

// TODO: setAligement, setHorizontalAlignement, setVerticalAlignment, setWrapText
// TODO: setBorders, setTopBorder, setRightBorder, setBottomBorder, setLeftBorder
// TODO: setNumFmt
// TODO: setFills, setFgFill, setBgFill
// TODO: color shortcuts
