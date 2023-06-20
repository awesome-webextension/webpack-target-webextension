# Changelog

## 1.1.0

- Deprecate `background.entry` and `background.manifest` in the config.
- Add `background.pageEntry` and `background.serviceWorkerEntry` in the config. Now you can build for both [limited event page](https://github.com/w3c/webextensions/issues/134) (used by [Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts) and Safari) and background service worker (Chrome) in a single webpack build.

### Migrations

If you have

- `background.manifest = 3`,
  1. remove `background.manifest`
  2. change `background.entry` to `background.serviceWorkerEntry`
- `background.manifest = 2` (or `undefined`),
  1. remove `background.manifest`
  2. change `background.entry` to `background.pageEntry`

## 1.0.5

Fix [frameId is missing when injecting content script (#36)](https://github.com/awesome-webextension/webpack-target-webextension/pull/36).

## 1.0.4

Fix [`__webpack_require__.e` is not a function in MV3 (#33)](https://github.com/awesome-webextension/webpack-target-webextension/issues/33).

## 1.0.3

Add `weakRuntimeCheck` option to support using with `mini-css-extract-plugin`.

## 1.0.2

Fix [false positive of `browser` when a dom id is browser (#28)](https://github.com/awesome-webextension/webpack-target-webextension/issues/28).

## 1.0.1

Fix chunk loading in MV3 background worker.

## 1.0.0

We made a big write to support Manifest V3.

### Breaking changes and migration

- Drop Webpack 4 support.
  1. Stay at `v0.2.1` if you cannot upgrade to webpack 5.
     (Webpack 4 support from `0.3.0` to `0.4.4` was broken).
  1. Upgrade to Webpack 5.
  1. Replace `target: WebExtensionTarget({...})` with `target: ["web", "ES2015"]`.
  1. Node polyfills are not supported in webpack 5.
     Please follow the webpack 5 migration guide to shim Node libraries.
  1. Add `new WebExtensionTarget()` to your plugins.
  1. Reconfigure this plugin.
- Drop Node 14- support.
- `webpack-target-webextension/lib/background` has been removed.
  - Remove `import 'webpack-target-webextension/lib/background'` from your project.
  - Configure `background` as in the README documented.
  - If you don't want it anymore, set `background.chunkLoaderFallback` to **false**.
- If you configured your `devServer` as pre-1.0.0 document suggested,
  you can try to remove them. `1.0.0` provides out-of-box auto configure to enable HMR.
  - Set `hmrConfig` to **false** to disable this feature.

## 0.4.4 - 2021-07-25

[Add dynamic import for webpack5. (#20)](https://github.com/awesome-webextension/webpack-target-webextension/pull/20)

## 0.4.3 - 2021-06-12

[Add support for injection in iframe. (#17)](https://github.com/awesome-webextension/webpack-target-webextension/pull/17)
