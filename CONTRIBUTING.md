# Contributing to _fxl.js_

First and foremost, thank you for taking an interest to contribute to _fxl.js_. This project can only improve with your help!

## Release Checklist for Maintainers

* Run test and lint tasks by running:
	* `yarn nx run-many --all --target=test`; and
	* `yarn nx run-many --all --target=lint`.
* Bump the version in `packages/core/package.json`.
* Update the API documentation by running `yarn docs`.
* Create a PR to merge to the upstream `develop` branch.
* Publish the package by running `yarn publish-to-npm` upstream.
