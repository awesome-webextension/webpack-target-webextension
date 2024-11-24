- TODO: let's set output.environment.dynamicImport to `true` by default.
- TODO: let's set hmr file names by default.

# webpack-target-webextension

[![npm-version](https://img.shields.io/npm/v/webpack-target-webextension.svg)](https://www.npmjs.com/package/webpack-target-webextension)

This webpack 5 plugin provides reasonable preset and fixes things don't work for a WebExtension.

Looking for webpack 4 support? See 0.2.1. [Document for 0.2.1](https://github.com/awesome-webextension/webpack-target-webextension/tree/a738d2ce96795cd032eb0ad3d6b6be74376550db).

The list of things we fixed in this plugin:

- Code splitting (chunk loader)
- Hot Module Reload
- Public path

## A quick guide

This guide is a reasonable default for a modern WebExtension project.

A minimal config should be like this:

> webpack.config.js

```js
module.exports = {
    context: __dirname,
    entry: {
        background: join(__dirname, './src/background/index.js'),
        content: join(__dirname, './src/content-script/index.js'),
        options: join(__dirname, './src/options-page/index.js'),
    },
    output: {
        path: join(__dirname, './dist'),
        publicPath: '/dist/',
    },
    plugins: [
        new HtmlRspackPlugin({ filename: 'options.html', chunks: ['options'] }),
        new WebExtension({
            background: { pageEntry: 'background' },
        }),
    ],
}
```

> manifest.json

```json
{
  "manifest_version": 3,
  "name": "Your extension",
  "version": "1.0.0",
  "background": {
    "service_worker": "./dist/background.js"
  },
  // ⚠ Those files can be accessed by normal web sites too.
  "web_accessible_resources": [
    {
      "resources": ["/dist/*.js"],
      "matches": ["<all_urls>"]
    },
    // only needed for development (hot module reload)
    {
      "resources": ["/dist/hot/*.js", "/dist/hot/*.json"],
      "matches": ["<all_urls>"]
    }
  ],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["./dist/content.js"]
    }
  ],
  "permissions": ["scripting"],
  "host_permissions": ["<all_urls>"],
  "options_ui": {
    "page": "options.html",
    "open_in_tab": true
  }
}
```

You can also refer to [./examples/react-hmr](./examples/react-hmr) which is a working project.

## Features & How to configure

### Code splitting

#### Content script

To load an async chunk in content scripts, you need to configure the chunk loader.

##### (default) dynamic `import()`

Compability: at least [Firefox 89](https://bugzilla.mozilla.org/show_bug.cgi?id=1536094) and Chrome 63.

You can set [`output.environment.dynamicImport`](https://webpack.js.org/configuration/output/#outputenvironment) to `false` to disable this loader.

You MUST add your JS files to `web_accessible_resources` in the `manifest.json`, otherwise the `import()` will fail.

> [!WARNING]
> Adding files to [`web_accessible_resources`](https://developer.chrome.com/docs/extensions/reference/manifest/web-accessible-resources) allows normal websites to access them.

Example: [./examples/code-splitting-way-1](./examples/code-splitting-way-1)

#### [`chrome.tabs.executeScript`](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-executeScript) (Manifest V2 only)

- This method requires [`options.background`](#options-background) to be configured.
- This method requires [`options.background.classicLoader`](#options-background) is not **false** (defaults to **true**).

Example: [./examples/code-splitting-way-2](./examples/code-splitting-way-2)

#### [`chrome.scripting.executeScript`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/scripting/executeScript) (Manifest V3 only)

- This method will fallback to `chrome.tabs.executeScript` when there is no `chrome.scripting`.
- This mehtod requires `"scripting"` permission in the `manifest.json`.
- This method requires [`options.background`](#options-background) to be configured.
- This method requires [`options.background.classicLoader`](#options-background) is not **false** (defaults to **true**).

Example: [./examples/code-splitting-way-3](./examples/code-splitting-way-3)

##### [Main world](https://developer.chrome.com/docs/extensions/reference/api/scripting#type-ExecutionWorld) content script

You need to configure the content script by dynamic `import()`. You also need to set [`output.publicPath`](https://webpack.js.org/configuration/output/#outputpublicpath) manually (like `chrome-extension://jknoiechepeohmcaoeehjaecapdplcia/dist/`, the full URL is necessary).

Example: [./examples/code-splitting-main-world](./examples/code-splitting-main-world).

#### Background worker (Manifest V3)

> [!WARNING]
> This plugin does not work with [`"background.type"`](https://developer.chrome.com/docs/extensions/reference/manifest/background) in `manifest.json` set to `"module"` (native ES Module service worker).
> Tracking issue: [#24](https://github.com/awesome-webextenson/webpack-target-webextension/issues/24)

Code splitting is supported for background service worker, but it will **load all chunks** initially.
See <https://bugs.chromium.org/p/chromium/issues/detail?id=1198822>.

This fix can be turned off by set [`options.background.eagerChunkLoading`](#options-background) to **false**.
If you turned of this fix, loading an async chunk will be a runtime error.

Example: [./examples/code-splitting-way-3](./examples/code-splitting-way-3)

### Hot Module Reload

> [!WARNING]
> It's not possible to support HMR for Manifest V3 background worker.
> See <https://bugs.chromium.org/p/chromium/issues/detail?id=1198822>

> [!WARNING]
> The HMR WebSocket server might be blocked by the Content Security Policy and prevent the reset of the code to be executed.
> Please disable hmr if you encountered this problem.

This plugin fixes Hot Module Reload and provide reasonable defaults for DevServer.
Please set `devServer.hot` to `false` to disable HMR support.

To disable this fix, set [`options.hmrConfig`](#options-hmrConfig) to **false**.

You need to add `*.json` to your `web_accessible_resources` in order to make HMR work.

Example: Manifest V2 [./examples/hmr-mv2](./examples/hmr-mv2)

Example: Manifest V3 [./examples/hmr-mv3](./examples/hmr-mv3)

Example: Draw UI in the content scripts with React and get React HRM. [./examples/react-hmr](./examples/react-hmr)

### Source map

> [!WARNING]
> No `eval` based source-map is available in Manifest v3.

> [!WARNING]
> DO NOT add `unsafe-eval` to your CSP in production mode!

To use source map based on `eval`, you must use Manifest v2 and have `script-src 'self' 'unsafe-eval';` in your [CSP (content security policy)](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_security_policy).

### Public path

This plugin fixes public path whether `output.path` is set or not.

## Options

### options.background

Example:

```ts
new WebExtensionPlugin({
  background: { pageEntry: 'background', serviceWorkerEntry: 'background-worker' },
})
```

```ts
export interface BackgroundOptions {
  /** Undocumented. */
  noWarningDynamicEntry?: boolean
  /**
   * The entry point of the background scripts
   * in your webpack config.
   * @deprecated
   * Use pageEntry and serviceWorkerEntry instead.
   */
  entry?: string
  /**
   * Using Manifest V2 or V3.
   *
   * If using Manifest V3,
   * the entry you provided will be packed as a Worker.
   *
   * @defaultValue 2
   * @deprecated
   */
  manifest?: 2 | 3
  /**
   * The entry point of the background page.
   */
  pageEntry?: string
  /**
   * The entry point of the service worker.
   */
  serviceWorkerEntry?: string
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

### options.hmrConfig

Default value: **true**

Example:

```ts
new WebExtensionPlugin({ hmrConfig: false })
```

### options.weakRuntimeCheck

If you encountered compatibility issue with any of the following plugin, you can enable this option:

- [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)
- [HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin)

## rspack limitation

rspack is missing
