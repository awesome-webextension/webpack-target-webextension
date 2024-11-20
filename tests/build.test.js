// @ts-check
const run = require('./utils/config')

test('Manifest v2 basic test', (done) => {
  run({
    done,
    input: './fixtures/basic',
    output: './snapshot/mv2-basic',
    option: { background: { pageEntry: 'background' } },
  })
})

// This test crashes in content script, "No loader for content script is found."
// This is expected. rspack version will not crash because it currently disables async chunks
test('Manifest v2 basic test, no option', (done) => {
  run({
    done,
    input: './fixtures/basic',
    output: './snapshot/mv2-basic-none',
    option: {},
  })
})

test('Manifest v3 basic test', (done) => {
  run({
    done,
    input: './fixtures/basic',
    output: './snapshot/mv3-basic',
    option: { background: { serviceWorkerEntry: 'background' } },
  })
})

// This test crashes in service worker, "document is not defined", which is expected.
test('Manifest v3 basic test, no option', (done) => {
  run({
    done,
    input: './fixtures/basic',
    output: './snapshot/mv3-basic-none',
    option: {},
  })
})

// TODO: this crashes
test('Manifest v2 + Manifest v3 dual entry test', (done) => {
  run({
    done,
    input: './fixtures/basic',
    output: './snapshot/mv3-dual',
    touch(config) {
      config.entry.backgroundWorker = './background.js'
    },
    option: { background: { pageEntry: 'background', serviceWorkerEntry: 'backgroundWorker' } },
    touchManifest(manifest) {
      manifest.background.service_worker = 'backgroundWorker.js'
    },
  })
})

test('Manifest v2 with native dynamic import enabled', (done) => {
  run({
    done,
    input: './fixtures/basic',
    output: './snapshot/mv2-basic+esm',
    touch(config) {
      config.output.environment = { dynamicImport: true }
    },
    option: { background: { pageEntry: 'background' } },
  })
})

test('Manifest v3 with native dynamic import enabled', (done) => {
  run({
    done,
    input: './fixtures/basic',
    output: './snapshot/mv3-basic+esm',
    touch(config) {
      config.output.environment = { dynamicImport: true }
    },
    option: { background: { serviceWorkerEntry: 'background' } },
  })
})

test('Manifest v2 with no dynamic import in code', (done) => {
  run({
    done,
    input: './fixtures/basic-no-dynamic-import',
    output: './snapshot/mv2-basic-no-dynamic-import',
    option: { background: { pageEntry: 'background' } },
  })
})

test('Manifest v3 with no dynamic import in code', (done) => {
  run({
    done,
    input: './fixtures/basic-no-dynamic-import',
    output: './snapshot/mv3-basic-no-dynamic-import',
    option: { background: { serviceWorkerEntry: 'background' } },
  })
})
