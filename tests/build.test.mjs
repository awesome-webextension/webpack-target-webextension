import rspack from '@rspack/core'
import { run } from './utils/config.mjs'
import { expect, test } from 'vitest'

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

test('Manifest v3 (splitChunks: all) test', () => {
  return run({
    input: './fixtures/basic',
    output: './snapshot/mv3-splitChunks-all',
    option: { background: { serviceWorkerEntry: 'background' } },
    touch(config) {
      config.optimization = { splitChunks: { chunks: 'all', minSize: 1 } }
    },
  })
})

test('Manifest v3 (splitChunks: all) + runtimeChunk test', () => {
  return run({
    input: './fixtures/basic',
    output: './snapshot/mv3-splitChunks-runtimeChunk',
    option: {
      background: { serviceWorkerEntry: 'background', serviceWorkerEntryOutput: 'sw.js' },
      weakRuntimeCheck: true,
    },
    touch(config) {
      config.optimization = {
        splitChunks: { chunks: 'all', minSize: 1 },
        runtimeChunk: {
          name({ name }) {
            if (name === 'background') return 'background-runtime'
            return 'runtime'
          },
        },
      }
    },
    touchManifest(manifest) {
      manifest.background.service_worker = 'sw.js'
    },
  })
})

test('Manifest v3 basic test (with public_path)', () => {
  return run({
    input: './fixtures/basic',
    output: './snapshot/mv3-basic-public-path',
    option: { background: { serviceWorkerEntry: 'background' } },
    touch(config) {
      config.output.publicPath = '/'
    },
  })
})

test('Manifest v3 basic test (with weakRuntime)', () => {
  return run({
    input: './fixtures/basic',
    output: './snapshot/mv3-basic-weak-runtime',
    option: { background: { serviceWorkerEntry: 'background' }, weakRuntimeCheck: true },
    touch(config) {
      config.output.publicPath = '/'
    },
  })
})

test('Manifest v3 HMR test', () => {
  return run({
    input: './fixtures/basic',
    output: './snapshot/mv3-hmr',
    option: { background: { serviceWorkerEntry: 'background' }, weakRuntimeCheck: true },
    touch(config, is_rspack) {
      if (is_rspack) {
        config.plugins.push(new rspack.HotModuleReplacementPlugin({}))
      }
    },
  })
})

// This crashes at runtime. This is expected. ReferenceError: document is not defined
test('Manifest v3 basic test, no option', () => {
  return run({
    input: './fixtures/basic',
    output: './snapshot/mv3-basic-none',
    option: {},
  })
})

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
