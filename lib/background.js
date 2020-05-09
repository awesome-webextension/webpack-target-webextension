/** Add this to background scripts */

const isChrome = typeof chrome !== 'undefined'

;(isChrome ? chrome : browser).runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'WTW_INJECT' && sender && sender.tab && sender.tab.id != null) {
    if (message.file) {
      const details = {
        frameId: sender.tab.frameId,
        file: message.file
      }
      const callback = () => sendResponse()
      if (isChrome) {
        chrome.tabs.executeScript(sender.tab.id, details, callback)
      } else {
        browser.tabs.executeScript(sender.tab.id, details).then(callback)
      }
      return true
    }
  }
})