import { Compiler } from 'webpack'

export interface BackgroundOptions {
  // TODO: rename to noDynamicEntryWarning
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
   * NOT working for rspack.
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

export interface WebExtensionPluginOptions {
  /** Append a thunk for Manifest V3 entry. */
  background?: BackgroundOptions
  /**
   * Configure HMR automatically for you.
   * @defaultValue true
   */
  hmrConfig?: boolean
  /**
   * Use a weak runtime check, in case the code will be evaluated during the compile.
   *
   * Enable this option when you're using mini-css-extract-plugin.
   * @defaultValue false
   */
  weakRuntimeCheck?: boolean
}
export default class Webpack5 {
  constructor(options?: WebExtensionPluginOptions)
  apply(compiler: Compiler): void
}
export = Webpack5
