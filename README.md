<p align="center">
    <img src="https://github.com/zero-one-group/fxl.js/raw/develop/logo/fxl.png" width="375px">
</p>

_fxl.js_ (_/ˈfɪk.səl/_ or "pixel" with an f) is a **data-oriented** JavaScript spreadsheet library built on top of [ExcelJS](https://github.com/exceljs/exceljs). The library focuses on **composability**, and aims to provide a way to build spreadsheets using modular, lego-like blocks. Its primary use case is for building spreadsheets based on human-designed templates that are not tabular.

_fxl.js_ is a JavaScript adaptation of the original Clojure library [fxl](https://github.com/zero-one-group/fxl).

# Contents

<ul>
  <li><a href="#installation">Installation</a></li>
  <li><a href="#why-fxljs">Why <i>fxl.js?</i></a></li>
  <li><a href="#examples">Examples</a></li>
    <ul>
      <li><a href="#cells-as-plain-data">Cells as Plain Data</a></li>
      <li><a href="#creating-a-spreadsheet">Creating a Spreadsheet</a></li>
      <li><a href="#loading-a-spreadsheet">Loading a Spreadsheet</a></li>
      <li><a href="#coordinate-shortcuts">Coordinate Shortcuts</a></li>
      <li><a href="#style-shortcuts">Style Shortcuts</a></li>
      <li><a href="#putting-things-together">Putting Things Together</a></li>
   </ul>
  <li><a href="#known-issues">Known Issues</a></li>
  <li><a href="#further-resources">Further Resources</a></li>
  <li><a href="#license">License</a></li>
</ul>

# Installation

_fxl.js_ has not been released yet.

# Why _fxl.js_?

There are three things that _fxl.js_ tries to do differently compared to other JavaScript spreadsheet libraries, namely:

1. **immutability:** the entire API requires no side effects or mutations except for the IO operations at the very start or end for reading and writing the spreadsheets respectively. With _fxl.js_, it is more ergonomic to work with data and pure functions until near the end of the application, where all the side effects are isolated and happen in one go - see [Functional Core, Imperative Shell](https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell).
2. **data orientation:** the data model is represented as plain, nested JavaScript objects with literal child nodes. This allows us to reuse common JavaScript functions/methods to manipulate objects, and easily integrate _fxl.js_ with functional utility libraries such as [Lodash](https://lodash.com/) and [Ramda](https://ramdajs.com/) - see [Alan Perlis' Epigram on common functions](https://stackoverflow.com/questions/6016271/why-is-it-better-to-have-100-functions-operate-on-one-data-structure-than-10-fun).
3. **cells as unordered collections of objects:** by expressing value, coordinate and style as three separate, orthogonal properties, we can work on the three components that make up spreadsheet separately. We can deal with interactions of the components only when we put them together. Expressing columns and rows as ordered sequences introduces complexity - see [Rich Hickey's take on the list-and-order problem](https://youtu.be/rI8tNMsozo0?t=1446).

_fxl.js_ is not built with performance in mind. It is built on top of ExcelJS, which thus sets the performance limit for the library. _fxl.js_ shines at building spreadsheets based on human-designed templates, which typically do not translate well to tabular formats such as CSVs, records or nested lists.

# Examples

## Cells as Plain Data

A _fxl.js_ cell is an object with three properties, namely value, coordinate and optionally style. The following are valid cells:

```typescript
{ value: 'abc', coord: { row: 0, col: 0 } }

{
  value: 1.23,
  coord: { row: 2, col: 3, sheet: 'Sheet 1' },
  style: {
    numFmt: '0.00%',
    border: {
      right: { style: 'medium', color: { argb: 'FF00FF00' } },
      left: { style: 'medium', color: { argb: 'FF00FF00' } },
    },
    font: { name: 'Roboto', size: 16, bold: true },
  },
}
```

By understanding the `fxl.Cell` interface, you are very close to being very productive with _fxl.js_! The rest of the library is composed of IO functions (such as `fxl.readXlsx` and `fxl.writeXlsx`) and shortcut functions that make life very easy when massaging the cell objects.

To find out more about _fxl.js_' cell interface, see [the interface declaration](packages/core/src/lib/types.ts) and [ExcelJS' cell value and style](https://github.com/exceljs/exceljs/blob/master/index.d.ts).


## Creating a Spreadsheet

Let's suppose that we would like to create a plain spreadsheet such as the following:

```
| Item     | Cost     |
| -------- | -------- |
| Rent     | 1000     |
| Gas      | 100      |
| Food     | 300      |
| Gym      | 50       |
| Total    | 1450     |
```

from an existing JavaScript array of objects such as the following:

```typescript
const costs = [
  { item: "Rent", cost: 1000 },
  { item: "Gas", cost: 100 },
  { item: "Food", cost: 300 },
  { item: "Gym", cost: 50 },
];
```

We would break the spreadsheet down into three components, namely the header, the body and the total

```typescript
const costs = [
  { item: 'Rent', cost: 1000 },
  { item: 'Gas', cost: 100 },
  { item: 'Food', cost: 300 },
  { item: 'Gym', cost: 50 },
];

const headerCells = [
  { value: 'Item', coord: { row: 0, col: 0 } },
  { value: 'Cost', coord: { row: 0, col: 1 } },
];

const bodyCells = costs.flatMap((record, index) => {
  return [
    { value: record.item, coord: { row: index + 1, col: 0 } },
    { value: record.cost, coord: { row: index + 1, col: 1 } },
  ];
});

const totalCells = [
  { value: 'Total', coord: { row: costs.length + 2, col: 0 } },
  {
    value: costs.map((x) => x.cost).reduce((x, y) => x + y),
    coord: { row: costs.length + 2, col: 1 },
  },
];
```

We then concatenate them, and ask _fxl.js_ to write the cells into an XLSX file:

```typescript
import * as fxl from '@zog/fxl.js';

const allCells = headerCells.concat(bodyCells).concat(totalCells);
await fxl.writeXlsx(allCells, 'costs.xlsx')
```

## Loading a Spreadsheet

## Coordinate Shortcuts

## Style Shortcuts

## Putting Things Together

See also the [inventory-spreadsheet walkthrough](docs/walkthrough.md) and its [accompanying script](packages/example/src/main.ts) for a more detailed example based on a real use case.

# Known Issues

* Column widths and row heights are not persisted after writing the spreadsheet. Loading an existing spreadsheet will contain no information regarding column widths and row heights.

See also [ExcelJS' known issues](https://github.com/exceljs/exceljs#known-issues).

# Contributing

_fxl.js_ is very much a work-in-progress. Whilst it is being used in production at [Zero One Group](www.zero-one-group.com), it may not be stable just yet. We would love your help to make it production ready! Any sort of contributions (issues, pull requests or general feedback) are all very welcomed!

# Further Resources

* [**fxl - composable data-oriented spreadsheet library for Clojure**](https://www.youtube.com/watch?v=d6qOzPQ9NUk) is a talk by one of the authors of `fxl.js` gave, which includes the inspiration and thinking behind the original Clojure library.

# License

Copyright 2021 Zero One Group.

_fxl.js_ is licensed under Apache License v2.0. It means that "users can do (nearly) anything they want with the code, with very few exceptions". See [here](https://fossa.com/blog/open-source-licenses-101-apache-license-2-0/) for more information.
