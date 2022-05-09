import * as coords from './coords';

describe('basic coordinate helper functions', () => {
  const table = coords.tableToCells([
    ['a', 'b'],
    ['x', 'y'],
  ]);
  const column = coords.colToCells([undefined, true, false]);
  const row = coords.rowToCells([1, undefined, 3]);
  const colWithMerges = [
    { value: 'abc', coord: { row: 0, col: 0, height: 2, width: 2 } },
    { value: 'def', coord: { row: 2, col: 0, height: 2, width: 2 } },
  ];
  const rowWithMerges = [
    { value: '123', coord: { row: 0, col: 0, height: 2, width: 2 } },
    { value: '456', coord: { row: 0, col: 2, height: 2, width: 2 } },
  ];

  it('setSheet should work properly', () => {
    const cells = row.map(coords.setSheet('abc-xyz'));
    expect(cells.map((x) => x.coord.sheet)).toEqual([
      'abc-xyz',
      'abc-xyz',
      'abc-xyz',
    ]);
  });

  it('concatBelow should work properly', () => {
    const cells = coords.concatBelow(table, row);
    const outputTable = coords.cellsToTable(cells);
    expect(outputTable).toEqual([
      ['a', 'b', undefined],
      ['x', 'y', undefined],
      [1, undefined, 3],
    ]);
  });

  it('concatBelow should work properly with merged cells', () => {
    const cells = coords.concatBelow(colWithMerges, table);
    const outputTable = coords.cellsToTable(cells);
    expect(outputTable).toEqual([
      ['abc', undefined],
      [undefined, undefined],
      ['def', undefined],
      [undefined, undefined],
      ['a', 'b'],
      ['x', 'y'],
    ]);
  });

  it('concatRight should work properly', () => {
    const cells = coords.concatRight(table, column);
    const outputTable = coords.cellsToTable(cells);
    expect(outputTable).toEqual([
      ['a', 'b', undefined],
      ['x', 'y', true],
      [undefined, undefined, false],
    ]);
  });

  it('concatRight should work properly with merged cells', () => {
    const cells = coords.concatRight(rowWithMerges, table);
    const outputTable = coords.cellsToTable(cells);
    expect(outputTable).toEqual([
      ['123', undefined, '456', undefined, 'a', 'b'],
      [undefined, undefined, undefined, undefined, 'x', 'y'],
    ]);
  });

  it('maxRow, maxCol lowestRow and lowestCol should work properly', () => {
    expect(coords.maxRow(table)).toBe(1);
    expect(coords.maxCol(table)).toBe(1);
    expect(coords.maxRow(column)).toBe(2);
    expect(coords.maxCol(column)).toBe(0);
    expect(coords.maxRow(row)).toBe(0);
    expect(coords.maxCol(row)).toBe(2);
    expect(coords.maxRow([])).toBe(-1);
    expect(coords.maxCol([])).toBe(-1);
    expect(coords.lowestRow([])).toBe(-1);
    expect(coords.rightmostCol([])).toBe(-1);
  });

  it('shift functions should work properly ', () => {
    const shiftedUp = table.map((x) => coords.shiftUp(10)(x));
    expect(coords.maxRow(shiftedUp)).toBe(-9);
    expect(coords.maxCol(shiftedUp)).toBe(1);
    const shiftedLeft = table.map((x) => coords.shiftLeft(5)(x));
    expect(coords.maxRow(shiftedLeft)).toBe(1);
    expect(coords.maxCol(shiftedLeft)).toBe(-4);
  });

  it('pad functions should work properly ', () => {
    const paddedBelow = coords.padBelow(2, row);
    expect(coords.cellsToTable(paddedBelow)).toEqual([
      [1, undefined, 3],
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
    ]);
    const paddedBelowZero = coords.padBelow(0, row);
    expect(coords.cellsToTable(paddedBelowZero)).toEqual([[1, undefined, 3]]);
    const paddedBelowNeg = coords.padBelow(-1, column);
    expect(coords.cellsToTable(paddedBelowNeg)).toEqual([
      [undefined],
      [undefined],
      [true],
      [false],
    ]);
    const paddedAbove = coords.padAbove(2, column);
    expect(coords.cellsToTable(paddedAbove)).toEqual([
      [undefined],
      [undefined],
      [undefined],
      [true],
      [false],
    ]);

    const paddedRight = coords.padRight(2, table);
    expect(coords.cellsToTable(paddedRight)).toEqual([
      ['a', 'b', undefined, undefined],
      ['x', 'y', undefined, undefined],
    ]);
    const paddedRightZero = coords.padRight(0, table);
    expect(coords.cellsToTable(paddedRightZero)).toEqual([
      ['a', 'b'],
      ['x', 'y'],
    ]);
    const paddedRightNeg = coords.padRight(-3, table);
    expect(coords.cellsToTable(paddedRightNeg)).toEqual([
      [undefined, undefined, undefined, 'a', 'b'],
      [undefined, undefined, undefined, 'x', 'y'],
    ]);
    const paddedLeft = coords.padLeft(2, table);
    expect(coords.cellsToTable(paddedLeft)).toEqual([
      [undefined, undefined, 'a', 'b'],
      [undefined, undefined, 'x', 'y'],
    ]);
  });
});

describe('basic cell creation helper functions', () => {
  const values = ['a', 'b', 123, 789];
  const records = [
    { a: 1, b: 2 },
    { a: 3, b: 4 },
  ];
  const table = [
    ['x', 'y'],
    [true, false],
  ];

  it('rowToCells should work properly', () => {
    const cells = coords.rowToCells(values);
    expect(cells.map((x) => x.value)).toEqual(values);
    const rangeArray = [...Array(values.length).keys()];
    expect(cells.map((x) => x.coord.col)).toEqual(rangeArray);
    expect(cells.map((x) => x.coord.row)).toEqual(Array(values.length).fill(0));
  });

  it('colToCells should work properly', () => {
    const cells = coords.colToCells(values);
    expect(cells.map((x) => x.value)).toEqual(values);
    const rangeArray = [...Array(values.length).keys()];
    expect(cells.map((x) => x.coord.row)).toEqual(rangeArray);
    expect(cells.map((x) => x.coord.col)).toEqual(Array(values.length).fill(0));
  });

  it('recordToCells should work properly', () => {
    const cells = coords.recordsToCells(['a', 'b'], records);
    const firstRow = cells.filter((x) => x.coord.row == 0).map((x) => x.value);
    expect(firstRow).toEqual([1, 2]);
    const secondCol = cells.filter((x) => x.coord.col == 1).map((x) => x.value);
    expect(secondCol).toEqual([2, 4]);
  });

  it('tableToCells should work properly', () => {
    const cells = coords.tableToCells(table);
    const firstRow = cells.filter((x) => x.coord.row == 0).map((x) => x.value);
    expect(firstRow).toEqual(['x', 'y']);
    const secondCol = cells.filter((x) => x.coord.col == 1).map((x) => x.value);
    expect(secondCol).toEqual(['y', false]);
  });

  it('cellsToTable should work properly', () => {
    const cells = coords.tableToCells(table);
    expect(table).toEqual(coords.cellsToTable(cells));
  });
});
