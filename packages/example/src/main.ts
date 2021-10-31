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
  return fxl.concatBelow(headerCells, bodyCells);
}

const inventoryCells = fxl.concatBelow(
  fxl.padBelow(1, singleQuarterInventoryCells('Q1', ['Jan', 'Feb', 'Mar'])),
  fxl.padBelow(1, singleQuarterInventoryCells('Q2', ['Apr', 'May', 'Jun'])),
  fxl.padBelow(1, singleQuarterInventoryCells('Q3', ['Jul', 'Aug', 'Sep'])),
  singleQuarterInventoryCells('Q4', ['Oct', 'Nov', 'Dec'])
);

const allCells = fxl.concatBelow(
  fxl.padBelow(2, formHeaderCells),
  fxl.padBelow(2, inventoryCells),
  fxl.concatRight(fxl.padRight(2, createFooterCells), checkFooterCells)
);

fxl.writeXlsx(allCells, 'temp.xlsx');

console.log(rawMaterials, formData);
