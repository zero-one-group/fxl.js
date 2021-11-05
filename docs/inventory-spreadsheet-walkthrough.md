# Inventory Spreadsheet Walkthrough

In this document, we will be walking through a simple spreadsheet-building exercise based on a real use case. We will discuss the general high-level strategy in a typical application of _fxl.js_, and provide the relevant code snippets. See the complete [source code](packages/example/src/main.ts) and the [example dataset](packages/example/src/assets/inventory.json) used in this document.

# Contents

<ul>
  <li><a href="#the-typical-fxljs-flow">The Typical <i>fxl.js</i> Flow</a></li>
  <li><a href="#an-inventory-planning-spreadsheet">An Inventory-Planning Spreadsheet</a></li>
  <li><a href="#component-building">Component Building</a></li>
    <ul>
      <li><a href="#component-1-form-headers">Component 1: Form Headers</a></li>
      <li><a href="#component-2-form-footers">Component 2: Form Footers</a></li>
      <li><a href="#component-3-inventory-table">Component 3: Inventory Table</a></li>
      <ul>
        <li> <a href="#sub-component-1-header">Sub-Component 1: Header</a></li>
        <li> <a href="#sub-component-2-raw-material-column">Sub-Component 2: Raw-Material Column</a></li>
        <li> <a href="#sub-component-3-single-month-inventory">Sub-Component 3: Single-Month Inventory</a></li>
        <li> <a href="#sub-integration-1-single-quarter-inventory">Sub-Integration 1: Single-Quarter Inventory</a></li>
        <li> <a href="#sub-integration-2-full-year-inventory">Sub-Integration 2: Full-Year Inventory</a></li>
      </ul>
    <li><a href="#integration-full-report">Integration: Full Report</a></li>
   </ul>
  <li><a href="#writing-to-file">Writing to File</a></li>
</ul>

## Working with Components

Building spreadsheets with _fxl.js_ should feel like building structures using lego blocks. Typically, we would start by creating individual components that make up the final structure separately before finally putting the structure together at the end. A component that makes up a structure may itself be composed of sub-components that go through a similar recursive process of isolated construction and integration.

Much like a lego structure, a _fxl.js_ spreadsheet is composed of a coherent group of cells that make a **spreadsheet component**. A component is coherent because it can typically be operated on as a unit - we may move it around or style them differently, and the group still serves the original purpose. 

We make a higher-level component through **integrating lower-level components**. For instance, a header of column names and a body of record values can be viewed as two separate components that make up a table. This table may, in turn, be used as a component that makes up an even higher-level component, such as a report page. 

Once we build up the entire spreadsheet through this recursive process of component building, the only thing left to do is to complete the **IO operation** by writing to a file.

Here's a simplistic, un-styled example of the three steps:

```typescript
// lowest level component building
const tableHeader = fxl.rowToCells(['Name', 'Surname', 'Age']);
const tableBody = fxl.tableToCells([
  ['Alice', 'Smith', 17],
  ['Bob', 'Thomas', 23],
  ['Cleo', 'Cameron', 37],
]);

// low-level component integration
const table = fxl.concatBelow(tableHeader, tableBody);

// medium-level component integration
const page = fxl.concatBelow(
  pageHeader,
  fxl.concatRight(table, anotherTable),
  pageFooter
);

// high-level component integration
const report = fxl.concateBelow(fxl.padBelow(2, page), anotherPage);

// IO operation
await fxl.writeXlsx(report, 'report.xlsx')
```

## An Inventory-Planning Spreadsheet

Our inventory-planning spreadsheet reports the actualised/projected opening stock, inflows and outflows of all raw materials every month grouped by quarter. The spreadsheet includes a header form to indicate the template ID along with the context of the report creation and two footer forms to indicate the PICs for creating and checking the report. The header form is automatically filled in, but the footer forms are intentionally left blank for the PICs to fill in by handwriting. The first-quarter figures are actualised, whereas the subsequent quarters are projections. Low and negative projected quantities should be flagged and made obvious on the report.

The following images illustrate the spreadsheet schematic template and the final spreadsheet divided into two pages:

<p align="center"></p>
<table>
    <thead>
        <tr>
            <th align="center">Spreadsheet Components</th>
            <th align="center">Page 1</th>
            <th align="center">Page 2</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td align="center">
                <img src="https://i.imgur.com/PYyW3Dr.png" width="400" />
            </td>
            <td align="center">
                <img src="https://i.imgur.com/cFYZVSl.png" width="275" />
            </td>
            <td align="center">
                <img src="https://i.imgur.com/SLqJbtH.png" width="275" />
            </td>
        </tr>
    </tbody>
</table>
<p></p>

## Component Building

Before we start the spreadsheet building process, we first need to prepare the dataset. Here's a cleaner, hard-coded version of the data preparation:

```typescript
import * as fs from 'fs';

const JSON_PATH = 'packages/example/src/assets/inventory.json';
const RAW_DATA = fs.readFileSync(JSON_PATH).toString();
const INVENTORY = JSON.parse(RAW_DATA);

const RAW_MATERIALS = [
  'Arrowroot',             'Caffeine',
  'Calciferol',            'Calcium Bromate',
  'Casein',                'Chlorine',
  'Chlorine Dioxide',      'Corn Syrup',
  'Dipotassium Phosphate', 'Disodium Phosphate',
  'Edible Bone phosphate', 'Extenders',
  'Fructose',              'Gelatine',
  'H. Veg. protein',       'Invert Sugar',
  'Iodine',                'Lactose',
  'Niacin/Nicotinic Acid', 'Polysorbate 60',
  'Potassium Bromate',     'Sodium Chloride/Salt',
  'Sucrose',               'Thiamine',
  'Vanillin',              'Yellow 2G'
]

const FORM_DATA = {
  docId: 'F-ABC-123',
  revisionNumber: 2,
  site: 'Jakarta',
  timestamp: 'Fri Nov 05 2021'
}
```

### Component 1: Form Headers
We start off with one of the simplest component, namely the report header that contains the document template ID and the report creation context.:

<p align="center">
  <img src="https://i.imgur.com/VZ6BhAP.png" width="400" />
</p>

The component has a tabular format, so we lay out the cell values as a nested array and invoke `fxl.tableToCells` to take care of the relative coordinates.

As for the style, we treat the first label column differently to the second value column. We bake this condition into a holistic styling function, before applying it to every cell in the component. If you are unfamiliar with `fxl.pipe` and the [curried](https://stackoverflow.com/questions/36314/what-is-currying) shortcut functions, see [_fxl.js_ Shortcut Functions](docs/fxljs-shortcut-functions.md).

```typescript
const plainFormHeader = fxl.tableToCells([
  ['Document ID:', FORM_DATA.docId],
  ['Revision Number:', FORM_DATA.revisionNumber],
  ['Site:', FORM_DATA.site],
  ['Timestamp', FORM_DATA.timestamp],
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
```

### Component 2: Form Footers

```typescript
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
```

### Component 3: Inventory Table

#### Sub-Component 1: Header

```typescript
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
```

#### Sub-Component 2: Raw-Material Column

```typescript
const rawMaterialColumn = fxl.colToCells(RAW_MATERIALS).map(setHeaderStyle);
```

#### Sub-Component 3: Single-Month Inventory

```typescript
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
```

#### Sub-Integration 1: Single-Quarter Inventory

```typescript
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
```

#### Sub-Integration 2: Full-Year Inventory

```typescript
const inventoryTables = fxl.concatBelow(
  fxl.padBelow(2, singleQuarterInventory('Q1', ['Jan', 'Feb', 'Mar'])),
  fxl.padBelow(2, singleQuarterInventory('Q2', ['Apr', 'May', 'Jun'])),
  fxl.padBelow(2, singleQuarterInventory('Q3', ['Jul', 'Aug', 'Sep'])),
  singleQuarterInventory('Q4', ['Oct', 'Nov', 'Dec'])
);
```

### Integration: Full Report

```typescript
const unstyledReport = fxl.concatBelow(
  fxl.padBelow(2, formHeader),
  fxl.padBelow(2, inventoryTables),
  fxl.concatRight(fxl.padRight(2, createFooter), checkFooter)
);

function setAutoColWidth(cell: fxl.Cell): fxl.Cell {
  if (cell.value) {
    const colWidth = Math.max(cell.value.toString().length, 10);
    return fxl.setColWidth(colWidth)(cell);
  } else {
    return cell;
  }
}

const report = unstyledReport.map(setAutoColWidth);
```

## Writing to File

```typescript
await fxl.writeXlsx(report, 'inventory-report.xlsx');
```
