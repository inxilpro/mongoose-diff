# Mongoose "Diff" Plugin

[![Build Status](https://travis-ci.org/inxilpro/mongoose-diff.svg?branch=master)](https://travis-ci.org/inxilpro/mongoose-diff)

This is a simple plugin to expose changes during the pre-save hooks.

## Installation

``` bash
$ npm install mongoose-diff --save
```

## Usage

``` js
var diff = require('mongoose-diff');

schema.plugin(diff, {}); // This needs to run BEFORE pre-save hooks

schema.pre('save', function(next) {
  if (this._diff) {
    // Do something with this._diff
  }
});
```

## Change Log

### 0.2.0
  - Merged lchenay's pull request #1:
      - Use a `virtual` instead of an object property
      - Don't apply transformations during toObject() calls
  - Updated dependencies
  - Added additional testing
  - Refactored code slightly
  - Exposed a `virtualName` option to change the virtual name from `_diff` to whatever you want

### 0.1.0
  - Initial release

