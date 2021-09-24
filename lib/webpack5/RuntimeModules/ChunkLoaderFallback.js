// @ts-check
/**
 * @param {import('webpack')} webpack
 */
module.exports = function ChunkLoaderFallbackRuntimeModule(webpack) {
  const { RuntimeModule, Template } = webpack
  class ChunkLoaderFallbackRuntimeModule extends RuntimeModule {
    constructor() {
      super('chunk loader fallback', RuntimeModule.STAGE_TRIGGER)
    }
    generate() {
      return Template.getFunctionContent(runtime)
    }
  }
  return new ChunkLoaderFallbackRuntimeModule()
}
var browser
var chrome

const runtime = function () {
  const isModern = typeof browser !== 'undefined'
  const runtime = isModern ? browser : chrome
  const root = runtime.runtime.getURL('/')
  runtime.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const cond = message && message.type === 'WTW_INJECT' && sender && sender.tab && sender.tab.id != null
    if (!cond) return
    let file = message.file
    try {
      file = new URL(file).pathname
    } catch {}
    if (!file) return
    const details = { frameId: sender.frameId, file }
    if (runtime.scripting) {
      runtime.scripting
        .executeScript({
          target: { tabId: sender.tab.id },
          files: [file],
        })
        .then(sendResponse)
    } else {
      if (isModern) {
        runtime.tabs.executeScript(sender.tab.id, details).then(sendResponse)
      } else {
        runtime.tabs.executeScript(sender.tab.id, details, sendResponse)
      }
    }
    return true
  })
}
