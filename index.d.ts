import { Compiler } from 'webpack'

export interface BackgroundOptions {
  /** Undocumented. */
  noDynamicEntryWarning?: boolean
  /**
   * @deprecated
   * Use pageEntry and/or serviceWorkerEntry instead.
   */
  entry?: never
  /** @deprecated */
  manifest?: never
  /**
   * The entry point of the background page.
   */
  pageEntry?: string
  /**
   * The entry point of the service worker.
   */
  serviceWorkerEntry?: string
  /**
   * The output of the service worker entry.
   *
   * Usually used with splitChunks.chunks or optimization.runtimeChunk.
   *
   * Set to "false" to disable the warning.
   */
  serviceWorkerEntryOutput?: string | false
  /**
   * Only affects Manifest V3.
   *
   * Load all chunks at the beginning to workaround the chrome bug
   * <https://bugs.chromium.org/p/chromium/issues/detail?id=1198822>.
   *
   * NOT working for rspack.
   *
   * @defaultValue true
   */
  eagerChunkLoading?: boolean
  /**
   * Add the support code that use
   * `chrome.scripting.executeScript` (MV3) or
   * `chrome.tabs.executeScript` (MV2) when
   * dynamic import does not work for chunk loading in the content script.
   * @defaultValue true
   */
  classicLoader?: boolean
  /**
   * Add a try-catch wrapper around the entry file of serviceWorkerEntry
   * so if the initial code throws, you can still open the console of it.
   *
   * Does not work in rspack.
   *
   * @defaultValue true
   */
  tryCatchWrapper?: boolean
}

export interface ContentScriptOptions {
  /**
   * **This is an experimental API. API might change at any time. Please provide feedback!**
   *
   * This option helps the initial chunk loading of content script,
   * usually needed when optimization.runtimeChunk or optimization.splitChunks.chunks is used.
   *
   * This option accepts an object, where the key are the entry name,
   * and the value is a string, *false*, or a function.
   *
   * If the value is a string, it creates an extra entry file to load all files **asynchronously**,
   * like HTMLWebpackPlugin but for content scripts.
   * This asynchronously loading behavior is limited to platform limit and **breaks**
   * [run_at](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_scripts#run_at).
   * The file name specified MUST NOT be any existing file.
   *
   * If the value is a function, it requires you to have a "manifest.json" in the emitted files
   * and letting you edit it on the fly to include all the initial chunks needed.
   *
   * If the value is **false**, it asserts that this entry does not have more than one initial file,
   * otherwise it will be a compile error.
   *
   * You can also change your configuration to avoid optimization.runtimeChunk or optimization.splitChunks.chunks.
   *
   * @defaultValue undefined
   * @example
   * ```ts
   * {
   *     // creates a entryName.js that dynamic import all the files needed.
   *     "entryName": "entryName.js",
   *     // edit the manifest.json directly to load all files synchronously.
   *     "entryName2": (manifest, files) => {
   *         manifest.content_scripts[0].js = files;
   *     },
   *     "entryName3": false,
   * }
   * ```
   */
  experimental_output?: Record<string, false | string | ((manifest: any, chunks: string[]) => void)>
}

export interface WebExtensionPluginOptions {
  /** Background page/service worker options. */
  background?: BackgroundOptions
  /**
   * Configure HMR automatically for you.
   * @defaultValue true
   */
  hmrConfig?: boolean
  /** Content script options. */
  contentScript?: ContentScriptOptions
  /**
   * Use a weak runtime check, in case the code will be evaluated during the compile.
   *
   * Enable this option when you're using mini-css-extract-plugin.
   * @defaultValue false
   */
  weakRuntimeCheck?: boolean
}
export default class WebExtensionPlugin {
  constructor(options?: WebExtensionPluginOptions)
  apply(compiler: Compiler): void
}
export = WebExtensionPlugin
