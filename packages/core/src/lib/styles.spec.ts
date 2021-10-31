import { toCell } from './cells';
import * as core from './core';
import * as styles from './styles';

describe('shortcut functions for styling', () => {
  const cells = [
    { value: undefined, coord: { row: 1, col: 2 } },
    toCell('abc'),
  ];

  cells.forEach((cell) => {
    it('font shortcut functions', () => {
      const styled = core.pipe(
        cell,
        styles.setBold(true),
        styles.setItalic(true),
        styles.setUnderline(false),
        styles.setStrike(false),
        styles.setFontName('Roboto'),
        styles.setFontSize(4),
        styles.setFontColor('FF00FF00')
      );
      expect(styled?.style?.font).toEqual({
        bold: true,
        italic: true,
        underline: false,
        strike: false,
        name: 'Roboto',
        size: 4,
        color: { argb: 'FF00FF00' },
      });
    });
  });
});
