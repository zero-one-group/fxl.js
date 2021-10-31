import * as fs from 'fs';

import * as fxl from '@zog/fxl.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface InventoryData {
  [month: string]: MonthsInventory;
}

interface MonthsInventory {
  opening: Quantities;
  inflows: Quantities;
  outflows: Quantities;
  closing: Quantities;
}

interface Quantities {
  [rawMaterial: string]: number;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const JSON_PATH = 'packages/example/src/assets/inventory.json';
const rawData = fs.readFileSync(JSON_PATH).toString();
const inventory = JSON.parse(rawData) as InventoryData;

function unique<T>(xs: T[]): T[] {
  return [...new Set(xs)].sort();
}
const values = Object.values;
const keys = Object.keys;

const rawMaterials = unique(
  values(inventory).flatMap((monthsInventory) =>
    values(monthsInventory).flatMap((quantities) => keys(quantities))
  )
);
const timestamp = new Date().toISOString();
const formData = {
  docId: 'F-ABC-123',
  revisionNumber: 2,
  site: 'Jakarta',
  timestamp: timestamp,
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
function setFormStyle(cell: fxl.Cell): fxl.Cell {
  const border = fxl.toBorder('medium', 'black');
  const setBorders = fxl.setAllBorders(border);
  if (cell.coord.col == 0) {
    return fxl.pipe(
      cell,
      setBorders,
      fxl.setBold(true),
      fxl.setHorizontalAlignement('right'),
      fxl.setSolidFg('light_gray')
    );
  } else {
    return fxl.pipe(cell, setBorders, fxl.setHorizontalAlignement('center'));
  }
}

function highlightShortage(cell: fxl.Cell): fxl.Cell {
  if (typeof cell.value == 'number') {
    if (cell.value > 100) {
      return cell;
    } else if (cell.value > 0) {
      return fxl.setSolidFg('yellow')(cell);
    } else {
      return fxl.pipe(cell, fxl.setSolidFg('red'), fxl.setFontColor('white'));
    }
  } else {
    return cell;
  }
}

function setInventoryStyle(cell: fxl.Cell): fxl.Cell {
  return fxl.pipe(
    cell,
    highlightShortage,
    fxl.setHorizontalAlignement('center'),
    fxl.setAllBorders(fxl.toBorder('thin', 'black')),
    fxl.applyIf(
      (cell) => cell.coord.row != 0 && cell.coord.col != 0,
      fxl.setNumFmt('#,##0')
    ),
    fxl.applyIf(
      (cell) => cell.coord.row <= 1 || cell.coord.col == 0,
      fxl.compose(fxl.setBold(true), fxl.setSolidFg('light_gray'))
    ),
    fxl.applyIf(
      (cell) => cell.coord.row != 0 && cell.coord.col == 0,
      fxl.setHorizontalAlignement('right')
    )
  );
}

// ---------------------------------------------------------------------------
// Cells
// ---------------------------------------------------------------------------
const formHeaderCells = fxl.tableToCells([
  ['Document ID:', formData.docId],
  ['Revision Number:', formData.revisionNumber],
  ['Site:', formData.site],
  ['Timestamp', formData.timestamp],
]);

const createFooterCells = fxl.tableToCells([
  ['Created By:', undefined],
  ['Date:', undefined],
]);

const checkFooterCells = fxl.tableToCells([
  ['Checked By:', undefined],
  ['Date:', undefined],
]);

function inventoryTableHeaderCells(
  quarter: string,
  months: [string, string, string]
): fxl.Cell[] {
  const firstRow = fxl.rowToCells([
    quarter,
    undefined,
    months[0],
    undefined,
    undefined,
    months[1],
    undefined,
    undefined,
    months[2],
    undefined,
  ]);
  const secondRow = fxl.rowToCells([
    'Raw Material',
    'Opening',
    'Inflows',
    'Outflows',
    'Opening',
    'Inflows',
    'Outflows',
    'Opening',
    'Inflows',
    'Outflows',
  ]);
  return fxl.concatBelow(firstRow, secondRow);
}

const rawMaterialColumnCells = fxl.colToCells(rawMaterials);

function singleMonthInventoryCells(month: string): fxl.Cell[] {
  const monthsInventory = inventory[month];
  const inventoryTable = rawMaterials.map((name) => [
    monthsInventory.opening[name],
    monthsInventory.inflows[name],
    monthsInventory.outflows[name],
  ]);
  return fxl.tableToCells(inventoryTable);
}

function singleQuarterInventoryCells(
  quarter: string,
  months: [string, string, string]
): fxl.Cell[] {
  const headerCells = inventoryTableHeaderCells(quarter, months);
  const bodyCells = fxl.concatRight(
    rawMaterialColumnCells,
    ...months.map(singleMonthInventoryCells)
  );
  return fxl.concatBelow(headerCells, bodyCells).map(setInventoryStyle);
}

const inventoryCells = fxl.concatBelow(
  fxl.padBelow(2, singleQuarterInventoryCells('Q1', ['Jan', 'Feb', 'Mar'])),
  fxl.padBelow(2, singleQuarterInventoryCells('Q2', ['Apr', 'May', 'Jun'])),
  fxl.padBelow(2, singleQuarterInventoryCells('Q3', ['Jul', 'Aug', 'Sep'])),
  singleQuarterInventoryCells('Q4', ['Oct', 'Nov', 'Dec'])
);

const allCells = fxl.concatBelow(
  fxl.padBelow(2, formHeaderCells.map(setFormStyle)),
  fxl.padBelow(2, inventoryCells),
  fxl.concatRight(
    fxl.padRight(2, createFooterCells.map(setFormStyle)),
    checkFooterCells.map(setFormStyle)
  )
);

fxl.writeXlsx(allCells, 'temp.xlsx');

console.log(rawMaterials, formData);
