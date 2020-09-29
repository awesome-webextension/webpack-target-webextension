// @ts-nocheck
module.exports = function () {
    // eslint-disable-next-line no-unused-vars
    function webpackHotUpdateCallback(chunkId, moreModules) {
        hotAddUpdateChunk(chunkId, moreModules)
        if (parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules)
    } //$semicolon

    // eslint-disable-next-line no-unused-vars
    function hotDownloadUpdateChunk(chunkId) {
        const api = typeof chrome === 'object' ? chrome : browser
        fetch(api.runtime.getURL($require$.p + $hotChunkFilename$))
            .then((x) => x.text())
            .then(eval)
    }

    // eslint-disable-next-line no-unused-vars
    function hotDownloadManifest(requestTimeout) {
        const api = typeof chrome === 'object' ? chrome : browser
        requestTimeout = requestTimeout || 10000
        const timeout = new Promise((r, re) =>
            setTimeout(() => re(new Error('hotDownloadManifest timeout')), requestTimeout)
        )
        timeout.catch(() => {})
        const request = () => fetch(api.runtime.getURL($require$.p + $hotMainFilename$)).then((x) => x.json())
        const sleep = () => new Promise((r) => setTimeout(r, 200))
        const retry = () => sleep().then(request)
        // Retry at most 3 times, cause the file may not been written to the disk yet.
        return Promise.race([timeout, request().catch(retry).catch(retry)])
    }
}
