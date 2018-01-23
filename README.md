# babel-plugin-transform-es2015-modules-simple-destructure-amd

Limited transformer for ECMAScript 2015 modules (AMD)

Converts this code:
```js
import x from '/path/to/x';
import y from '/path/to/y';
import React, { Component } from 'react';
doSomething();
export default x + y;
```

Into this one:
```js
define(['/path/to/x', '/path/to/y', 'react'], function (x, y, React) {
    var Component = React.Component;
    doSomething();
    return x + y;
});
```

Instead of this one (generated with ``babel-plugin-transform-es2015-modules-amd``):
```js
define(['exports', '/path/to/x', '/path/to/y', 'react'], function (exports, _x, _y, _react) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _x2 = _interopRequireDefault(_x);

  var _y2 = _interopRequireDefault(_y);

  var _react2 = _interopRequireDefault(_react);

  var _component2 = _react2.default.Component;

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      'default': obj
    };
  }

  doSomething();
  exports.default = _x2.default + _y2.default;
});
```

Supported features:
- ``import SPECIFIER from 'PATH'``
- ``import 'PATH'``
- ``import {SPECIFIER1, SPECIFIER2 as SPECIFIER3} from 'PATH'``
- ``import SPECIFIER1, {SPECIFIER2, SPECIFIER3 as SPECIFIER4} from 'PATH'``
- ``export default NODE``

Other features aren't supported.

**Warning**. If no ``import`` or ``export`` are presented in JavaScript file, the plugin does nothing (means it doesn't wrap code with ``define``).

## Installation

```sh
$ npm install --save-dev babel-plugin-transform-es2015-modules-simple-destructure-amd
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["transform-es2015-modules-simple-destructure-amd"]
}
```

### Via Node API

```javascript
require('babel').transform('code', {
  plugins: ['transform-es2015-modules-simple-destructure-amd']
});
```

Thanks to [finom](https://github.com/finom/babel-plugin-transform-es2015-modules-simple-amd).
