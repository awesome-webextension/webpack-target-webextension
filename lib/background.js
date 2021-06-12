/** Add this to background scripts */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'WTW_INJECT' && sender && sender.tab && sender.tab.id != null) {
    let file = message.file
    try {
      file = new URL(file).pathname
    } catch {}
    if (file) {
      const details = {
        frameId: sender.tab.frameId,
        file,
      }
      chrome.tabs.executeScript(sender.tab.id, details, () => sendResponse())
      return true
    }
  }
})
