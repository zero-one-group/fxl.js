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

Our inventory-planning spreadsheet reports the actualised/projected opening stock, inflows and outflows of all raw materials every month grouped by quarter. The spreadsheet report includes a header form to indicate the template ID along with the context of the report creation and two footer forms to indicate the PICs for creating and checking the report. The header form is automatically filled in, but the footer forms are intentionally left blank for the PICs to fill in by handwriting. The first-quarter figures are actualised, whereas the subsequent quarters are projections. Low and negative projected quantities should be flagged on the report.

The following images illustrate the spreadsheet schematic template and the final spreadsheet:

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

## Working with Components

Building spreadsheets with _fxl.js_ should feel like building structures using lego blocks. We would start by creating individual components that make up the final structure separately before finally putting the structure together at the end. A component that makes up a structure may itself be composed of sub-components that go through a similar recursive process of isolated construction and integration.

A spreadsheet component is a coherent group of cells that can be operated on as a unit - we may move the group around or style them differently, and it remains a coherent unit. For instance, a header of column names and a body of record values can be viewed as two separate components that make up a table. This table is, in turn, a component that makes up a higher-level component, such as a report page.

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
