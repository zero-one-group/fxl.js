import { toColor } from './colors';
import * as t from './types';

/**
 * Returns a new Cell with modified number format.
 *
 * @param {string} numFmt
 * @returns {t.Monoid<t.Cell>}
 */
export function setNumFmt(numFmt: string): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const style = { ...cell.style, numFmt: numFmt };
    return { ...cell, style: style };
  };
}

// ---------------------------------------------------------------------------
// Fill Shortcuts
// ---------------------------------------------------------------------------
export const DEFAULT_FILL: t.Fill = { type: 'pattern', pattern: 'none' };

/**
 * Returns a new Cell with modified fill.
 *
 * @param {t.Fill} fill
 * @returns {t.Monoid<t.Cell>}
 */
export function setFill(fill: t.Fill): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const style = { ...cell.style, fill: fill };
    return { ...cell, style: style };
  };
}

/**
 * Returns a valid Fill object.
 *
 * @remarks
 * Use named colors as presented in:
 * {@link https://github.com/codebrainz/color-names/blob/master/output/colors.json}
 *
 * @param {t.Fill} pattern
 * @param {fgColor} fgColor
 * @param {bgColor} bgColor
 * @returns {t.Monoid<t.Cell>}
 */
export function toFill(
  pattern: t.FillPatterns,
  fgColor: t.Color,
  bgColor: t.Color
): t.Fill {
  return {
    type: 'pattern',
    pattern: pattern,
    fgColor: fgColor,
    bgColor: bgColor,
  };
}

/**
 * Returns a new Cell with modified solid foreground.
 *
 * @remarks
 * Use named colors as presented in:
 * {@link https://github.com/codebrainz/color-names/blob/master/output/colors.json}
 *
 * @param {string} color
 * @returns {t.Monoid<t.Cell>}
 */
export function setSolidFg(color: string): t.Monoid<t.Cell> {
  return setFill({
    type: 'pattern',
    pattern: 'solid',
    fgColor: toColor(color),
  });
}

/**
 * Returns a new Cell with modified solid background.
 *
 * @remarks
 * Use named colors as presented in:
 * {@link https://github.com/codebrainz/color-names/blob/master/output/colors.json}
 *
 * @param {string} color
 * @returns {t.Monoid<t.Cell>}
 */
export function setSolidBg(color: string): t.Monoid<t.Cell> {
  return setFill({
    type: 'pattern',
    pattern: 'solid',
    bgColor: toColor(color),
  });
}

// ---------------------------------------------------------------------------
// Border Shortcuts
// ---------------------------------------------------------------------------
function getBorders(cell: t.Cell): t.Borders {
  return cell.style?.border ?? {};
}

/**
 * Returns a new Cell with modified borders.
 *
 * @param {t.Borders} borders
 * @returns {t.Monoid<t.Cell>}
 */
export function setBorders(borders: t.Borders): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const style = { ...cell.style, border: borders };
    return { ...cell, style: style };
  };
}

/**
 * Returns a new Cell with modified borders on all four sides.
 *
 * @param {t.Border} border
 * @returns {t.Monoid<t.Cell>}
 */
export function setAllBorders(border: t.Border): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const borders = {
      ...getBorders(cell),
      top: border,
      right: border,
      bottom: border,
      left: border,
    };
    return setBorders(borders)(cell);
  };
}

/**
 * Returns a new Cell with one modified border.
 *
 * @param {'top' | 'right' | 'bottom' | 'left'} side
 * @param {t.Border} border
 * @returns {t.Monoid<t.Cell>}
 */
export function setBorder(
  side: 'top' | 'right' | 'bottom' | 'left',
  border: t.Border
): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const borders = { ...getBorders(cell), [side]: border };
    return setBorders(borders)(cell);
  };
}

/**
 * Returns a valid Border object.
 *
 * @remarks
 * Use named colors as presented in:
 * {@link https://github.com/codebrainz/color-names/blob/master/output/colors.json}
 *
 * @param {t.BorderStyle} style
 * @param {string} color
 * @returns {t.Monoid<t.Cell>}
 */
export function toBorder(style: t.BorderStyle, color: string): t.Border {
  return { style: style, color: toColor(color) };
}

// ---------------------------------------------------------------------------
// Alignment Shortcuts
// ---------------------------------------------------------------------------
function getAlignment(cell: t.Cell): t.Alignment {
  return cell.style?.alignment ?? {};
}

/**
 * Returns a new Cell with modified aligment.
 *
 * @param {t.Alignment} alignment
 * @returns {t.Monoid<t.Cell>}
 */
export function setAlignment(alignment: t.Alignment): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const style = { ...cell.style, alignment: alignment };
    return { ...cell, style: style };
  };
}

/**
 * Returns a new Cell with modified horizontal aligment.
 *
 * @param {t.HorizontalAlignment} horizontal
 * @returns {t.Monoid<t.Cell>}
 */
export function setHorizontalAlignement(
  horizontal: t.HorizontalAlignment
): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const alignment = { ...getAlignment(cell), horizontal: horizontal };
    return setAlignment(alignment)(cell);
  };
}

/**
 * Returns a new Cell with modified vertical aligment.
 *
 * @param {t.VerticalAlignment} vertical
 * @returns {t.Monoid<t.Cell>}
 */
export function setVerticalAlignement(
  vertical: t.VerticalAlignment
): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const alignment = { ...getAlignment(cell), vertical: vertical };
    return setAlignment(alignment)(cell);
  };
}

/**
 * Returns a new Cell with modified wrap-text.
 *
 * @param {boolean} wrapText
 * @returns {t.Monoid<t.Cell>}
 */
export function setWrapText(wrapText: boolean): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const alignment = { ...getAlignment(cell), wrapText: wrapText };
    return setAlignment(alignment)(cell);
  };
}

// ---------------------------------------------------------------------------
// Font Shortcuts
// ---------------------------------------------------------------------------
function getFont(cell: t.Cell): t.Font {
  return cell.style?.font ?? {};
}

/**
 * Returns a new Cell with modified font.
 *
 * @param {t.Font} font
 * @returns {t.Monoid<t.Cell>}
 */
export function setFont(font: t.Font): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const style = { ...cell.style, font: font };
    return { ...cell, style: style };
  };
}

/**
 * Returns a new Cell with modified bold flag.
 *
 * @param {boolean} bold
 * @returns {t.Monoid<t.Cell>}
 */
export function setBold(bold: boolean): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const font = { ...getFont(cell), bold: bold };
    return setFont(font)(cell);
  };
}

/**
 * Returns a new Cell with modified italic flag.
 *
 * @param {boolean} italic
 * @returns {t.Monoid<t.Cell>}
 */
export function setItalic(italic: boolean): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const font = { ...getFont(cell), italic: italic };
    return setFont(font)(cell);
  };
}

/**
 * Returns a new Cell with modified underline flag.
 *
 * @param {boolean} underline
 * @returns {t.Monoid<t.Cell>}
 */
export function setUnderline(underline: boolean): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const font = { ...getFont(cell), underline: underline };
    return setFont(font)(cell);
  };
}

/**
 * Returns a new Cell with modified strike flag.
 *
 * @param {boolean} strike
 * @returns {t.Monoid<t.Cell>}
 */
export function setStrike(strike: boolean): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const font = { ...getFont(cell), strike: strike };
    return setFont(font)(cell);
  };
}

/**
 * Returns a new Cell with modified font name.
 *
 * @param {string} fontName
 * @returns {t.Monoid<t.Cell>}
 */
export function setFontName(fontName: string): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const font = { ...getFont(cell), name: fontName };
    return setFont(font)(cell);
  };
}

/**
 * Returns a new Cell with modified font size.
 *
 * @param {number} fontSize
 * @returns {t.Monoid<t.Cell>}
 */
export function setFontSize(fontSize: number): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const font = { ...getFont(cell), size: fontSize };
    return setFont(font)(cell);
  };
}

/**
 * Returns a new Cell with modified font color.
 *
 * @remarks
 * Use named colors as presented in:
 * {@link https://github.com/codebrainz/color-names/blob/master/output/colors.json}
 *
 * @param {string} fontColor
 * @returns {t.Monoid<t.Cell>}
 */
export function setFontColor(fontColor: string): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const font = { ...getFont(cell), color: toColor(fontColor) };
    return setFont(font)(cell);
  };
}

// ---------------------------------------------------------------------------
// Cell Sizes
// ---------------------------------------------------------------------------

/**
 * Returns a new Cell with modified column width.
 *
 * @remarks
 * During writing, cell sizes are aggregated, and the maximum is used as the
 * actual size.
 * WARNING: Cell sizes are not persisted. It is not restored during reading.
 *
 * @param {number} colWidth
 * @returns {t.Monoid<t.Cell>}
 */
export function setColWidth(colWidth: number): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const style = { ...cell.style, colWidth: colWidth };
    return { ...cell, style: style };
  };
}

/**
 * Returns a new Cell with modified row height.
 *
 * @remarks
 * During writing, cell sizes are aggregated, and the maximum is used as the
 * actual size.
 * WARNING: Cell sizes are not persisted. It is not restored during reading.
 *
 * @param {number} rowHeight
 * @returns {t.Monoid<t.Cell>}
 */
export function setRowHeight(rowHeight: number): t.Monoid<t.Cell> {
  return (cell: t.Cell) => {
    const style = { ...cell.style, rowHeight: rowHeight };
    return { ...cell, style: style };
  };
}
