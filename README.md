# Mongoose "Diff" Plugin

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

### 0.1.0
  - Initial release

