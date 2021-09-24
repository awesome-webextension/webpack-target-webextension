import { Compiler } from 'webpack'
import { Webpack4UsedImports } from './lib/webpack4/webpack4-used'
declare class Webpack5 {
  apply(compiler: Compiler): void
}
/** This functionality is not available in Webpack 5. */
// export interface Webpack4NodeConfig {}
interface Plugin {
  /** Webpack 4 */
  (nodeConfig: any, imports?: Webpack4UsedImports): (compiler: Compiler) => void
  /** Webpack 5 */
  new (): Webpack5
}
declare const plugin: Plugin
export default plugin
