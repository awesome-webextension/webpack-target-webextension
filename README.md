# [webpack-target-webextension](https://github.com/crimx/webpack-target-webextension)

[![npm-version](https://img.shields.io/npm/v/webpack-target-webextension.svg)](https://www.npmjs.com/package/webpack-target-webextension)

WebExtension Target for Webpack 4. Supports code-splitting with native dynamic import(with `tabs.executeScript` as fallback).

You can use the [neutrino-webextension preset](https://github.com/crimx/neutrino-webextension) directly which uses this library.

The code is based on the official web target.

## Limitation

In content scripts native dynamic import subjects to target page content security policy. This library adds `tabs.executeScript` as fallback method should native dynamic import fails.

But do note that `tabs.executeScript` does not work for pages without tab, like background page and browser action page(also known as popup page). This is fine since they are all extension internal pages where native dynamic import should always work.

## Caveats

Native dynamic import is [buggy](https://bugzilla.mozilla.org/show_bug.cgi?id=1536094) in Firefox. A workaround is to write a postbuild script targeting only Firefox build. It collects all the dynamic chunks and appends them to every entries in htmls and the `manifest.json` script lists.

The Firefox addons-linter is also [making aggressive errors](https://github.com/mozilla/addons-linter/issues/2498) on dynamic import. A workaround is to just replace the `import` with other name. Since all the dynamic chunks are loaded in Firefox the `import()` code should never be run.

## Installation

yarn

```bash
yarn add webpack-target-webextension
```

npm

```bash
npm install webpack-target-webextension
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
  // Need to set these fields manually as their default values rely on `web` target.
  // See https://v4.webpack.js.org/configuration/resolve/#resolvemainfields
  resolve: {
    mainFields: ['browser', 'module', 'main'],
    aliasFields: ['browser']
  },
  output: {
    globalObject: 'window'
    // relative to extension root
    publicPath: '/assets/',
  },
  optimization: {
    // Chrome bug https://bugs.chromium.org/p/chromium/issues/detail?id=1108199
    splitChunks: { automaticNameDelimiter: '-' },
  },
  target: WebExtensionTarget(nodeConfig)
}
```

```js
// manifest.json

{
  // Make sure chunks are accessible.
  // For example, if webpack outputs js and css to `assets`:
  "web_accessible_resources": ["assets/*"],
}
```

```js
// src/background.js

// For fallback `tabs.executeScript`
import 'webpack-target-webextension/lib/background'

// ... your code
```

### Hot Module Reload and development tips

This target supports HMR too, but you need to tweak manifest.json and open some webpack options to make it work.

#### Changes in manifest.json

**Those changes are only needed in development!! Don't add them in production!!**

Please include this line in the manifest to make sure HMR manifest and new chunks are able to downloaded.

```json
"web_accessible_resources": ["*.js", "*.json"],
```

Please include this line if you want to use `eval` based sourcemaps.

```json
"content_security_policy": "script-src 'self' blob: filesystem: 'unsafe-eval';",
```

#### Changes in webpack config

```js
devServer: {
  // Have to write disk cause plugin cannot be loaded over network
  writeToDisk: true,
  hot: true,
  hotOnly: true,
  // WDS does not support chrome-extension:// browser-extension://
  disableHostCheck: true,
  injectClient: true,
  injectHot: true,
  headers: {
    // We're doing CORS request for HMR
    'Access-Control-Allow-Origin': '*'
  },
  // If the content script runs in https, webpack will connect https://localhost:HMR_PORT
  // More on https://webpack.js.org/configuration/dev-server/#devserverhttps
  https: true
},
```

#### Webpack 5 support

Support for Webpack 5 is still in development. It will break any time.
