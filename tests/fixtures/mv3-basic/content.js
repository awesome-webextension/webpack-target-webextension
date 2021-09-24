import('./log').then(({ log }) => {
  log('this is content script')
  chrome.runtime.sendMessage('Hi!')
})
