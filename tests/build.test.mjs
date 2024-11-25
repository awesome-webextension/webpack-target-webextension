import rspack from '@rspack/core'
import { run } from './utils/config.mjs'
import { test } from 'vitest'

test('Manifest v2 basic test', () => {
  return run({
    input: './fixtures/basic',
    output: './snapshot/mv2-basic',
    option: { background: { pageEntry: 'background' } },
  })
})

test('Manifest v2 HMR test', () => {
  return run({
    input: './fixtures/basic',
    output: './snapshot/mv2-hmr',
    option: { background: { pageEntry: 'background' } },
    touch(config, is_rspack) {
      if (is_rspack) {
        config.plugins.push(new rspack.HotModuleReplacementPlugin({}))
      }
    },
  })
})

// This test crashes in content script, "No loader for content script is found."
// This is expected. rspack version will not crash because it currently disables async chunks
test('Manifest v2 basic test, no option', () => {
  return run({
    input: './fixtures/basic',
    output: './snapshot/mv2-basic-none',
    option: {},
  })
})

test('Manifest v3 basic test', () => {
  return run({
    input: './fixtures/basic',
    output: './snapshot/mv3-basic',
    option: { background: { serviceWorkerEntry: 'background' } },
  })
})

// This test crashes in service worker, "document is not defined", which is expected.
test('Manifest v3 basic test, no option', () => {
  return run({
    input: './fixtures/basic',
    output: './snapshot/mv3-basic-none',
    option: {},
  })
})

// TODO: this crashes
test('Manifest v2 + Manifest v3 dual entry test', () => {
  return run({
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

test('Manifest v2 with native dynamic import disabled', () => {
  return run({
    input: './fixtures/basic',
    output: './snapshot/mv2-basic-no-esm',
    touch(config) {
      config.output.environment = { dynamicImport: false }
    },
    option: { background: { pageEntry: 'background' } },
  })
})

test('Manifest v3 with native dynamic import disabled', () => {
  return run({
    input: './fixtures/basic',
    output: './snapshot/mv3-basic-no-esm',
    touch(config) {
      config.output.environment = { dynamicImport: false }
    },
    option: { background: { serviceWorkerEntry: 'background' } },
  })
})

test('Manifest v2 with no dynamic import in code', () => {
  return run({
    input: './fixtures/basic-no-dynamic-import',
    output: './snapshot/mv2-basic-no-dynamic-import',
    option: { background: { pageEntry: 'background' } },
  })
})

test('Manifest v3 with no dynamic import in code', () => {
  return run({
    input: './fixtures/basic-no-dynamic-import',
    output: './snapshot/mv3-basic-no-dynamic-import',
    option: { background: { serviceWorkerEntry: 'background' } },
  })
})
