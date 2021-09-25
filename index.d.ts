import { Compiler } from 'webpack'

export interface BackgroundOptions {
  /** The entry point name of your background */
  entry: string
  noWarningDynamicEntry?: boolean
  /** @defaultValue 2 */
  manifest?: 2 | 3
  /**
   * @defaultValue true
   * Load all chunks at the beginning.
   */
  eagerChunkLoading?: boolean
  /**
   * @defaultValue true
   * Load fallback support code for dynamic chunk loading in content script.
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
}
export default class Webpack5 {
  constructor(options?: WebExtensionPluginOptions)
  apply(compiler: Compiler): void
}
