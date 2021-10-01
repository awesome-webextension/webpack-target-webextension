import './hmr'
console.log('Hello from background')

// Assets
const assets = new URL('./assets/file.txt', import.meta.url)
fetch(assets)
  .then((response) => response.text())
  .then((file) => console.log(`[Assets test] Assets ${assets}: ${file}`))

// Dynamic import
setTimeout(async () => {
  const { add } = await import('./shared/utils.js')
  console.log('[import test] import("/shared/utils.js")', add)
}, 200)

// Worker
try {
  new Worker(new URL('./shared/worker.js', import.meta.url))
} catch (e) {
  console.warn(
    '[Worker test] Create new Worker is not supported in MV3. See https://bugs.chromium.org/p/chromium/issues/detail?id=1219164'
  )
}
