import 'webpack-target-webextension/lib/background'

import('./log').then(({ log }) => {
  log('this is background script')
  chrome.runtime.onMessage.addListener((message) => {
    log(`receive message from content script`, message)
  })
})
new Worker(new URL('./worker', import.meta.url))
