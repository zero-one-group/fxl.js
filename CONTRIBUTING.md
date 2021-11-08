# Contributing to _fxl.js_

First and foremost, thank you for taking an interest to contribute to _fxl.js_. This project can only improve with your help!

## Release Checklist

* Run test and lint tasks by running:
	* `yarn nx run-many --all --target=test`; and
	* `yarn nx run-many --all --target=lint`.
* Bump the version in `packages/core/package.json`.
* Build the library by running `yarn nx build core`.
* Step into the dist directory and publish by running:
	* `cd dist/packages/core`; and
	* `yarn publish --access public`.
* Generate the documentation page and push to `gh-pages`:
	* `cd packages/core/src`;
	* `npx typedoc index.ts`;
	* check-in the resulting docs to an orphan branch; and
	* create a PR to the `gh-pages` branch.
