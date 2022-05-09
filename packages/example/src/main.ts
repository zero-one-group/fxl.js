import * as fs from 'fs';

import * as fxl from '@01group/fxl';

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
function unique<T>(xs: T[]): T[] {
  return [...new Set(xs)].sort();
}

const values = Object.values;
const keys = Object.keys;

const JSON_PATH = 'packages/example/src/assets/inventory.json';
const RAW_DATA = fs.readFileSync(JSON_PATH).toString();
const INVENTORY = JSON.parse(RAW_DATA) as InventoryData;

const RAW_MATERIALS = unique(
  values(INVENTORY).flatMap((monthsInventory) =>
    values(monthsInventory).flatMap(keys)
  )
);

const FORM_DATA = {
  docId: 'F-ABC-123',
  revisionNumber: 2,
  site: 'Jakarta',
  timestamp: new Date().toDateString(),
};

// ---------------------------------------------------------------------------
// Component 0: Title
// ---------------------------------------------------------------------------
const title = [
  fxl.pipe(
    fxl.toCell(`INVENTORY REPORT (Year ${new Date().getFullYear()})`),
    fxl.setCoord({ row: 0, col: 0, width: 10, height: 3 }),
    fxl.setBold(true),
    fxl.setUnderline(true),
    fxl.setFontSize(18),
    fxl.setHorizontalAlignement('center')
  ),
];

// ---------------------------------------------------------------------------
// Component 1: Form Headers
// ---------------------------------------------------------------------------
const plainFormHeader = fxl.tableToCells([
  ['Document ID:', FORM_DATA.docId],
  ['Revision Number:', FORM_DATA.revisionNumber],
  ['Site:', FORM_DATA.site],
  ['Timestamp:', FORM_DATA.timestamp],
]);

function setFormStyle(cell: fxl.Cell): fxl.Cell {
  const setBorders = fxl.setAllBorders(fxl.toBorder('medium', 'black'));
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

const formHeader = plainFormHeader.map(setFormStyle);

// ---------------------------------------------------------------------------
// Component 2: Form Footers
// ---------------------------------------------------------------------------
const plainCreateFooter = fxl.tableToCells([
  ['Created By:', undefined],
  ['Date:', undefined],
]);

const plainCheckFooter = fxl.tableToCells([
  ['Checked By:', undefined],
  ['Date:', undefined],
]);

const createFooter = plainCreateFooter.map(setFormStyle);
const checkFooter = plainCheckFooter.map(setFormStyle);

// ---------------------------------------------------------------------------
// Component 3: Inventory Table
// ---------------------------------------------------------------------------

// Sub-Component 1: Header
function setHeaderStyle(cell: fxl.Cell): fxl.Cell {
  return fxl.pipe(cell, fxl.setBold(true), fxl.setSolidFg('light_gray'));
}

function inventoryHeader(
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
  return fxl.concatBelow(firstRow, secondRow).map(setHeaderStyle);
}

// Sub-Component 2: Raw-Material Column
const rawMaterialColumn = fxl.colToCells(RAW_MATERIALS).map(setHeaderStyle);

// Sub-Component 3: Single-Month Inventory
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

function setInventoryBodyStyle(cell: fxl.Cell): fxl.Cell {
  return fxl.pipe(cell, highlightShortage, fxl.setNumFmt('#,##0'));
}

function singleMonthInventory(month: string): fxl.Cell[] {
  const monthsInventory = INVENTORY[month];
  const inventoryTable = RAW_MATERIALS.map((name) => [
    monthsInventory.opening[name],
    monthsInventory.inflows[name],
    monthsInventory.outflows[name],
  ]);
  return fxl.tableToCells(inventoryTable).map(setInventoryBodyStyle);
}

// Integration 1: Single-Quarter Inventory
function setInventoryTableStyle(cell: fxl.Cell): fxl.Cell {
  return fxl.pipe(
    cell,
    fxl.setAllBorders(fxl.toBorder('thin', 'black')),
    fxl.applyIfElse(
      (x) => x.coord.col == 0 && x.coord.row != 0,
      fxl.setHorizontalAlignement('right'),
      fxl.setHorizontalAlignement('center')
    )
  );
}

function singleQuarterInventory(
  quarter: string,
  months: [string, string, string]
): fxl.Cell[] {
  const singleMonthBodies = months.map(singleMonthInventory);
  const plain = fxl.concatBelow(
    inventoryHeader(quarter, months),
    fxl.concatRight(rawMaterialColumn, ...singleMonthBodies)
  );
  return plain.map(setInventoryTableStyle);
}

// Integration 2: Full-Year Inventory
const inventoryTables = fxl.concatBelow(
  fxl.padBelow(2, singleQuarterInventory('Q1', ['Jan', 'Feb', 'Mar'])),
  fxl.padBelow(2, singleQuarterInventory('Q2', ['Apr', 'May', 'Jun'])),
  fxl.padBelow(2, singleQuarterInventory('Q3', ['Jul', 'Aug', 'Sep'])),
  singleQuarterInventory('Q4', ['Oct', 'Nov', 'Dec'])
);

// ---------------------------------------------------------------------------
// Integration: Full Report
// ---------------------------------------------------------------------------
const unstyledReport = fxl.concatBelow(
  fxl.padBelow(2, title),
  fxl.padBelow(2, formHeader),
  fxl.padBelow(2, inventoryTables),
  fxl.concatRight(fxl.padRight(2, createFooter), checkFooter)
);

function setAutoColWidth(cell: fxl.Cell): fxl.Cell {
  if (cell.value && cell.coord.row != 0) {
    const colWidth = Math.max(cell.value.toString().length, 10);
    return fxl.setColWidth(colWidth)(cell);
  } else {
    return cell;
  }
}

const report = unstyledReport.map(setAutoColWidth);

// ---------------------------------------------------------------------------
// Integration: Full Report
// ---------------------------------------------------------------------------
async function main() {
  await fxl.writeXlsx(report, 'inventory-report.xlsx');
  console.log(`Wrote to inventory-report.xlsx!\n${new Date()}`);

  const loadedCells = await fxl.readXlsx('inventory-report.xlsx');
  if (loadedCells.ok) {
    const numCells = loadedCells.val.length;
    console.log(`Read ${numCells} cells from inventory-report.xlsx!`);
    console.log('__________________________________________________');
  }

  const individualComponents = [
    formHeader,
    createFooter,
    checkFooter,
    inventoryHeader('Q3', ['Jul', 'Aug', 'Sep']),
    rawMaterialColumn,
    singleMonthInventory('Dec'),
    singleQuarterInventory('Q3', ['Jul', 'Aug', 'Sep']),
    fxl.concatBelow(
      fxl.padBelow(2, singleQuarterInventory('Q1', ['Jan', 'Feb', 'Mar'])),
      fxl.padBelow(2, singleQuarterInventory('Q2', ['Apr', 'May', 'Jun'])),
      fxl.padBelow(2, singleQuarterInventory('Q3', ['Jul', 'Aug', 'Sep'])),
      singleQuarterInventory('Q4', ['Oct', 'Nov', 'Dec'])
    ),
  ];
  const paddedComponents = individualComponents.map((component) =>
    fxl.padRight(1, component)
  );
  await fxl.writeXlsx(
    fxl.concatRight(...paddedComponents).map(setAutoColWidth),
    'components.xlsx'
  );
  console.log(`Wrote to components.xlsx!\n${new Date()}`);
  console.log('__________________________________________________');
}

main();
