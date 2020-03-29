import('./log').then(({ log }) => {
  log('this is background script')
  chrome.runtime.onMessage.addListener(message => {
    log(`receive message "${message}" from content script`)
  })
})
