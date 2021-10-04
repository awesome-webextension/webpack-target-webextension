import './hmr'
console.log('Hello from content script')

// Assets
const assets = new URL('./assets/file.txt', import.meta.url)
fetch(assets)
  .then((response) => response.text())
  .then((file) => console.log(`[Assets test] Assets ${assets}: ${file}`))
  .catch((err) => {
    console.warn(`[Assets test] Error while loading asset ${assets}
If you want to load this from content scripts,
try add "web_accessible_resources": ["/dist/*.txt"] in your manifest.json.

WARNING: Normal web sites like ${location} can access those resources too. Be caution.`)
  })

// Dynamic import
setTimeout(async () => {
  const { add } = await import('./shared/utils.js')
  console.log('[import test] import("/shared/utils.js")', add)
}, 200)

// Worker
console.log('[Worker test] But it is not possible to create a Worker this way from content script.')
try {
  new Worker(new URL('./shared/worker.js', import.meta.url))
} catch (e) {
  console.error(e)
}
console.log('[Worker test] Instead, you need to do this (and webpack will not bundle it for you).')
new Worker(
  URL.createObjectURL(
    new Blob(['console.log("[Worker test] [Inside Worker] Raw javascript, no webpack bundle")'], {
      type: 'text/javascript',
    })
  )
)
