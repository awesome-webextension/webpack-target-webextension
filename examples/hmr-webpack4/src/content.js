import { log } from './shared'

console.log(log())

module.hot.accept('./shared', () => {
  console.log(log())
})
