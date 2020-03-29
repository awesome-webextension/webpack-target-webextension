# [webpack-target-webextension](https://github.com/crimx/webpack-target-webextension)

[![npm-version](https://img.shields.io/npm/v/webpack-target-webextension.svg)](https://www.npmjs.com/package/webpack-target-webextension)

WebExtension Target for Webpack 4. Supports code-splitting with native dynamic import.

You can use the [neutrino-webextension preset](https://github.com/crimx/neutrino-webextension) directly which uses this library.

The code is based on the official web target.

## Installation

yarn

```bash
yarn add -D webpack-target-webextension
```

npm

```bash
npm install -D webpack-target-webextension
```

## Usage

You might also need to remove the `@babel/plugin-syntax-dynamic-import` plugin.

```js
// webpack.config.js

const path = require('path')
const WebExtensionTarget = require('')

// Optional webpack node config
const nodeConfig = {}

module.exports = {
  node: nodeConfig
  output: {
    // set it relative to manifest.json in production
    publicPath: '/assets/',
  },
  target: WebExtensionTarget(nodeConfig)
}
```

```js
// manifest.json

{
  // make sure chunks are accessible
  "web_accessible_resources": ["assets/*"],
}
```