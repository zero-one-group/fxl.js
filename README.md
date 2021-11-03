<p align="center">
    <img src="https://github.com/zero-one-group/fxl.js/raw/develop/logo/fxl.png" width="375px">
</p>

_fxl.js_ (_/ˈfɪk.səl/_ or "pixel" with an f) is a **data-oriented** JavaScript spreadsheet library built on top of [ExcelJS](https://github.com/exceljs/exceljs). The library focuses on **composability**, and aims to provide a way to build spreadsheets using modular, lego-like blocks. Its primary use case is for building spreadsheets based on human-designed templates that are not tabular.

_fxl.js_ is an adaptation of the original Clojure library [fxl]('https://github.com/zero-one-group/fxl').

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

## Creating a Spreadsheet

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
