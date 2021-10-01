import { value } from './shared/constant.js'

const isWorker = typeof importScripts === 'function'
if (import.meta.webpackHot) {
  const head = `[HMR test]${isWorker ? ' [Inside Worker]' : ''}`
  if (isWorker) {
    console.warn(head, 'HMR in Worker does not work. Help wanted.')
  }
  console.log(`${head} constant =`, value, '. Try edit /shared/constant.js to see changes')

  import.meta.webpackHot.accept('./shared/constant.js', () => {
    console.log(`${head} constant updated to`, value)
  })
}
