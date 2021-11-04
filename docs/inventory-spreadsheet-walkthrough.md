# Inventory Spreadsheet Walkthrough

In this document, we will be walking through a simple spreadsheet-building exercise based on a real use case. We will discuss the general high-level strategy in a typical application of _fxl.js_, and provide the relevant code snippets. See the complete source code and example dataset.

# Contents

<ul>
  <li><a href="#an-inventory-planning-spreadsheet">An Inventory-Planning Spreadsheet</a></li>
  <li><a href="#why-fxljs">Why <i>fxl.js?</i></a></li>
  <li><a href="#the-typical-fxljs-flow">The Typical <i>fxl.js</i> Flow</a></li>
  <li><a href="#component-building">Component Building</a></li>
    <ul>
      <li><a href="#component-1-form-headers">Component 1: Form Headers</a></li>
      <li><a href="#component-2-form-footers">Component 2: Form Footers</a></li>
      <li><a href="#component-3-inventory-table">Component 3: Inventory Table</a></li>
      <ul>
        <li> <a href="#sub-component-1-header">Sub-Component 1: Header</a></li>
        <li> <a href="#sub-component-2-raw-material-column">Sub-Component 2: Raw-Material Column</a></li>
        <li> <a href="#sub-component-3-single-month-inventory">Sub-Component 3: Single-Month Inventory</a></li>
        <li> <a href="#integration-1-single-quarter-inventory">Integration 1: Single-Quarter Inventory</a></li>
        <li> <a href="#integration-1-full-year-inventory">Integration 2: Full-Year Inventory</a></li>
      </ul>
   </ul>
  <li><a href="#component-integration-writing-to-file">Component Integration + Writing to File</a></li>
</ul>

## An Inventory-Planning Spreadsheet

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

## The Typical _fxl.js_ Flow

1. Spreadsheet Components
	 a. Values
	 b. Coordinates
	 c. Styles
2. Component Integration
3. Write to File

## Component Building

### Component 1: Form Headers

### Component 2: Form Footers

### Component 3: Inventory Table

#### Sub-Component 1: Header

#### Sub-Component 2: Raw-Material Column

#### Sub-Component 3: Single-Month Inventory

#### Integration 1: Single-Quarter Inventory

#### Integration 2: Full-Year Inventory

## Component Integration + Writing to File
