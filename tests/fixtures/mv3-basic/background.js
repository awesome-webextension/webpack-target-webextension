import 'webpack-target-webextension/lib/background'

setTimeout(async () => {
  const { log } = await import('./log')
  log('this is background script')
  chrome.runtime.onMessage.addListener((message) => {
    log(`receive message from content script`, message)
  })
}, 200)
