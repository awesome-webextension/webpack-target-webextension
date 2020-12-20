import 'webpack-target-webextension/lib/background'
import { log } from './shared'

console.log(log())

if (module.hot) {
  module.hot.accept('./shared', (nextMod) => {
    console.log(log())
  })
}
