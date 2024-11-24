import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@rspack/cli'
import { rspack } from '@rspack/core'
import RefreshPlugin from '@rspack/plugin-react-refresh'
import WebExtension from 'webpack-target-webextension'

const __dirname = dirname(fileURLToPath(import.meta.url))
const targets = ['chrome >= 87', 'edge >= 88', 'firefox >= 78', 'safari >= 14']

export default (_, env) => {
  const isProduction = env.mode === 'production'
  return defineConfig({
    devtool: 'source-map',
    context: __dirname,
    output: {
      path: join(__dirname, './dist'),
      // Our assets are emitted in /dist folder of our web extension.
      publicPath: '/dist/',
      hotUpdateChunkFilename: 'hot/[id].[fullhash].hot-update.js',
      hotUpdateMainFilename: 'hot/[runtime].[fullhash].hot-update.json',
      environment: {
        dynamicImport: true,
      },
    },
    entry: {
      background: join(__dirname, './src/background/index.ts'),
      content: join(__dirname, './src/content-script/index.tsx'),
      options: join(__dirname, './src/content-script/index.tsx'),
    },
    resolve: {
      extensions: ['...', '.ts', '.tsx', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.(jsx?|tsx?)$/,
          use: [
            {
              loader: 'builtin:swc-loader',
              options: {
                jsc: {
                  parser: { syntax: 'typescript', tsx: true },
                  transform: {
                    react: { runtime: 'automatic', development: !isProduction, refresh: !isProduction },
                  },
                },
                env: { targets },
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new rspack.HtmlRspackPlugin({ filename: 'options.html', chunks: ['options'] }),
      new rspack.CopyRspackPlugin({
        patterns: [{ from: 'manifest.json' }],
      }),
      new WebExtension({
        background: { pageEntry: 'background' },
      }),
      isProduction ? null : new RefreshPlugin(),
    ].filter(Boolean),
    optimization: {
      minimizer: [false],
    },
    experiments: {
      css: true,
    },
  })
}
