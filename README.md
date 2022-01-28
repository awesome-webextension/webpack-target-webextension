# webpack-target-webextension

[![npm-version](https://img.shields.io/npm/v/webpack-target-webextension.svg)](https://www.npmjs.com/package/webpack-target-webextension)

WebExtension Plugin for Webpack 5. Supports code-splitting and Hot Module Reload.

Looking for webpack 4 support? Please install 0.2.1. [Document for 0.2.1](https://github.com/awesome-webextension/webpack-target-webextension/tree/a738d2ce96795cd032eb0ad3d6b6be74376550db).

## Installation

Choose the package manager you're using.

```bash
yarn add -D webpack-target-webextension
npm install -D webpack-target-webextension
pnpm install -D webpack-target-webextension
```

## Features & How to configure

### Code splitting

#### Content script

You need to configure at least one of the following
to make code-splitting work for the content script.

1. dynamic `import()`
   - Requires [Firefox 89](https://bugzilla.mozilla.org/show_bug.cgi?id=1536094) and
     Chrome 63(?).
   - Set `output.environment.dynamicImport` to `true` in your webpack config.
   - You must set `web_accessible_resources` to your JS files in your `manifest.json`.
   - ⚠ Normal web sites can access your resources in `web_accessible_resources` too.
   - Example: [./examples/code-splitting-way-1](./examples/code-splitting-way-1)
2. via `chrome.tabs.executeScript` (Manifest V2)
   - Requires [`options.background`](#options-background) to be configured
     and [`options.background.classicLoader`](#options-background) is not **false** (defaults to **true**).
   - Example: [./examples/code-splitting-way-2](./examples/code-splitting-way-2)
3. via `chrome.scripting.executeScript` (Manifest V3)
   - **Chrome only**.
   - It will fallback to _method 2_ when there is no `chrome.scripting`.
   - Requires `"scripting"` permission in the `manifest.json`.
   - Requires [`options.background`](#options-background) to be configured
     and [`options.background.classicLoader`](#options-background) is not **false** (defaults to **true**).
   - Example: [./examples/code-splitting-way-3](./examples/code-splitting-way-3)


#### Background worker (Manifest V3)

> ⚠ Not working with `"background.type"` set to `"module"` (native ES Module service worker). Tracking issue: [#24](https://github.com/awesome-webextension/webpack-target-webextension/issues/24)

Support code-splitting out of the box,
but it will load **all** chunks (but not execute them).

See https://bugs.chromium.org/p/chromium/issues/detail?id=1198822 for the reason.

This fix can be turned off by setting
[`options.background.eagerChunkLoading`](#options-background) to **false**.

Example: [./examples/code-splitting-way-3](./examples/code-splitting-way-3)

### Hot Module Reload

> ⚠ It's not possible to support HMR for Manifest V3 background worker before
> this bug is fixed. https://bugs.chromium.org/p/chromium/issues/detail?id=1198822

> ⚠ In content script of Firefox, the HMR WebSocket server might be blocked by the Content Security Policy and prevent the reset of the code to be executed. Please disable hmr if you encountered this problem.

This plugin works with Hot Module Reload.
Please set `devServer.hot` to `"only"` (or `true`) to enable it.
It will modify your `devServer` configuration to adapt to the Web Extension environment.
To disable this behavior, set [`options.hmrConfig`](#options-hmrConfig) to **false**.

You need to add `*.json` to your `web_accessible_resources` in order to download HMR manifest.

Example: Manifest V2 [./examples/hmr-mv2](./examples/hmr-mv2)

Example: Manifest V3 [./examples/hmr-mv3](./examples/hmr-mv3)

Example: Draw UI in the content scripts with React and get React HRM. [./examples/react-hmr](./examples/react-hmr)

### Source map

To use source map based on `eval`, you must use Manifest V2 and have `script-src 'self' 'unsafe-eval';` in your CSP (content security policy).

> ⚠ DO NOT add `unsafe-eval` to your CSP in production mode!

### Public path

This plugin supports the public path when `output.path` is set.

## <a id="options"></a>Options

### <a id="options-background"></a>`options`.`background`

Example:

```ts
new WebExtensionPlugin({
  background: { entry: 'background', manifest: 2 },
})
```

```ts
export interface BackgroundOptions {
  /**
   * The entry point of the background scripts
   * in your webpack config.
   */
  entry: string
  /**
   * Using Manifest V2 or V3.
   *
   * If using Manifest V3,
   * the entry you provided will be packed as a Worker.
   *
   * @defaultValue 2
   */
  manifest?: 2 | 3
  /**
   * Only affects in Manifest V3.
   *
   * Load all chunks at the beginning
   * to workaround the chrome bug
   * https://bugs.chromium.org/p/chromium/issues/detail?id=1198822.
   *
   * @defaultValue true
   */
  eagerChunkLoading?: boolean
  /**
   * Add the support code that use
   * `chrome.scripting.executeScript` (MV3) or
   * `chrome.tabs.executeScript` (MV2) when
   * dynamic import does not work for chunk loading
   * in the content script.
   * @defaultValue true
   */
  classicLoader?: boolean
}
```

### <a id="options-hmrConfig"></a>`options`.`hmrConfig`

Default value: **true**

Example:

```ts
new WebExtensionPlugin({ hmrConfig: false })
```
