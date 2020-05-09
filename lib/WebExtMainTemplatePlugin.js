const { SyncWaterfallHook } = require('tapable')
const Template = require('webpack/lib/Template')

class WebExtMainTemplatePlugin {
  apply(mainTemplate) {
    const needChunkOnDemandLoadingCode = chunk => {
      for (const chunkGroup of chunk.groupsIterable) {
        if (chunkGroup.getNumberOfChildren() > 0) return true
      }
      return false
    }
    const needChunkLoadingCode = chunk => {
      for (const chunkGroup of chunk.groupsIterable) {
        if (chunkGroup.chunks.length > 1) return true
        if (chunkGroup.getNumberOfChildren() > 0) return true
      }
      return false
    }

    // TODO webpack 5, no adding to .hooks, use WeakMap and static methods
    ;['jsonpScript'].forEach(hook => {
      if (!mainTemplate.hooks[hook]) {
        mainTemplate.hooks[hook] = new SyncWaterfallHook([
          'source',
          'chunk',
          'hash'
        ])
      }
    })

    const getScriptSrcPath = (hash, chunk, chunkIdExpression) => {
      const chunkFilename = mainTemplate.outputOptions.chunkFilename
      const chunkMaps = chunk.getChunkMaps()
      return mainTemplate.getAssetPath(JSON.stringify(chunkFilename), {
        hash: `" + ${mainTemplate.renderCurrentHashCode(hash)} + "`,
        hashWithLength: length =>
          `" + ${mainTemplate.renderCurrentHashCode(hash, length)} + "`,
        chunk: {
          id: `" + ${chunkIdExpression} + "`,
          hash: `" + ${JSON.stringify(
            chunkMaps.hash
          )}[${chunkIdExpression}] + "`,
          hashWithLength(length) {
            const shortChunkHashMap = Object.create(null)
            for (const chunkId of Object.keys(chunkMaps.hash)) {
              if (typeof chunkMaps.hash[chunkId] === 'string') {
                shortChunkHashMap[chunkId] = chunkMaps.hash[chunkId].substr(
                  0,
                  length
                )
              }
            }
            return `" + ${JSON.stringify(
              shortChunkHashMap
            )}[${chunkIdExpression}] + "`
          },
          name: `" + (${JSON.stringify(
            chunkMaps.name
          )}[${chunkIdExpression}]||${chunkIdExpression}) + "`,
          contentHash: {
            javascript: `" + ${JSON.stringify(
              chunkMaps.contentHash.javascript
            )}[${chunkIdExpression}] + "`
          },
          contentHashWithLength: {
            javascript: length => {
              const shortContentHashMap = {}
              const contentHash = chunkMaps.contentHash.javascript
              for (const chunkId of Object.keys(contentHash)) {
                if (typeof contentHash[chunkId] === 'string') {
                  shortContentHashMap[chunkId] = contentHash[chunkId].substr(
                    0,
                    length
                  )
                }
              }
              return `" + ${JSON.stringify(
                shortContentHashMap
              )}[${chunkIdExpression}] + "`
            }
          }
        },
        contentHashType: 'javascript'
      })
    }
    mainTemplate.hooks.localVars.tap(
      'WebExtMainTemplatePlugin',
      (source, chunk, hash) => {
        const extraCode = []
        if (needChunkLoadingCode(chunk)) {
          extraCode.push(
            '',
            '// object to store loaded and loading chunks',
            '// undefined = chunk not loaded, null = chunk preloaded/prefetched',
            '// Promise = chunk loading, 0 = chunk loaded',
            'var installedChunks = {',
            Template.indent(
              chunk.ids.map(id => `${JSON.stringify(id)}: 0`).join(',\n')
            ),
            '};',
            ''
          )
        }
        if (needChunkOnDemandLoadingCode(chunk)) {
          extraCode.push(
            '',
            '// script path function',
            'function webextScriptSrc(chunkId) {',
            Template.indent([
              `var publicPath = ${mainTemplate.requireFn}.p`,
              `var scriptSrcPath = publicPath + ${getScriptSrcPath(
                hash,
                chunk,
                'chunkId'
              )};`,
              `if (!publicPath || !publicPath.includes('://')) {
                return (typeof chrome === 'undefined' ? browser : chrome).runtime.getURL(
                  scriptSrcPath
                );
              } else {
                return scriptSrcPath;
              }`
            ]),
            '}'
          )
        }
        if (extraCode.length === 0) return source
        return Template.asString([source, ...extraCode])
      }
    )

    mainTemplate.hooks.jsonpScript.tap(
      'WebExtMainTemplatePlugin',
      (_, chunk, hash) => {
        const chunkLoadTimeout = mainTemplate.outputOptions.chunkLoadTimeout

        return Template.asString([
          'var script = webextScriptSrc(chunkId);',
          'var onScriptComplete;',
          '// create error before stack unwound to get useful stacktrace later',
          'var error = new Error();',
          'onScriptComplete = function (event) {',
          Template.indent([
            'clearTimeout(timeout);',
            'var chunk = installedChunks[chunkId];',
            'if(chunk !== 0) {',
            Template.indent([
              'if(chunk) {',
              Template.indent([
                "var errorType = event && (event.type === 'load' ? 'missing' : event.type);",
                "error.message = 'Loading chunk ' + chunkId + ' failed.\\n(' + errorType + ': ' + script + ')';",
                "error.name = 'ChunkLoadError';",
                'error.type = errorType;',
                'error.request = script;',
                'chunk[1](error);'
              ]),
              '}',
              'installedChunks[chunkId] = undefined;'
            ]),
            '}'
          ]),
          '};',
          'var timeout = setTimeout(function(){',
          Template.indent(["onScriptComplete({ type: 'timeout' });"]),
          `}, ${chunkLoadTimeout});`
        ])
      }
    )
    mainTemplate.hooks.requireEnsure.tap(
      'WebExtMainTemplatePlugin load',
      (source, chunk, hash) => {
        return Template.asString([
          source,
          '',
          '// Dynamic import chunk loading for javascript',
          '',
          'var installedChunkData = installedChunks[chunkId];',
          'if(installedChunkData !== 0) { // 0 means "already installed".',
          Template.indent([
            '',
            '// a Promise means "currently loading".',
            'if(installedChunkData) {',
            Template.indent(['promises.push(installedChunkData[2]);']),
            '} else {',
            Template.indent([
              '// setup Promise in chunk cache',
              'var promise = new Promise(function(resolve, reject) {',
              Template.indent([
                'installedChunkData = installedChunks[chunkId] = [resolve, reject];'
              ]),
              '});',
              'promises.push(installedChunkData[2] = promise);',
              '',
              '// start chunk loading',
              mainTemplate.hooks.jsonpScript.call('', chunk, hash),
              "import(script).then(onScriptComplete, () => onScriptComplete({ type: 'missing' }));"
            ]),
            '}'
          ]),
          '}'
        ])
      }
    )
    mainTemplate.hooks.requireEnsure.tap(
      {
        name: 'WebExtMainTemplatePlugin preload',
        stage: 10
      },
      (source, chunk, hash) => {
        const chunkMap = chunk.getChildIdsByOrdersMap().preload
        if (!chunkMap || Object.keys(chunkMap).length === 0) return source
        return Template.asString([
          source,
          '',
          '// chunk preloadng for javascript',
          '',
          `var chunkPreloadMap = ${JSON.stringify(chunkMap, null, '\t')};`,
          '',
          'var chunkPreloadData = chunkPreloadMap[chunkId];',
          'if(chunkPreloadData) {',
          Template.indent([
            'chunkPreloadData.forEach(function(chunkId) {',
            Template.indent([
              'if(installedChunks[chunkId] === undefined) {',
              Template.indent([
                'installedChunks[chunkId] = null;',
                mainTemplate.hooks.linkPreload.call('', chunk, hash),
                'import(link);'
              ]),
              '}'
            ]),
            '});'
          ]),
          '}'
        ])
      }
    )
    mainTemplate.hooks.requireExtensions.tap(
      'WebExtMainTemplatePlugin',
      (source, chunk) => {
        if (!needChunkOnDemandLoadingCode(chunk)) return source

        return Template.asString([
          source,
          '',
          '// on error function for async loading',
          `${mainTemplate.requireFn}.oe = function(err) { console.error(err); throw err; };`
        ])
      }
    )
    mainTemplate.hooks.bootstrap.tap(
      'WebExtMainTemplatePlugin',
      (source, chunk, hash) => {
        if (needChunkLoadingCode(chunk)) {
          return Template.asString([
            source,
            '',
            '// install a JSONP callback for chunk loading',
            'function webpackJsonpCallback(data) {',
            Template.indent([
              'var chunkIds = data[0];',
              'var moreModules = data[1];',
              '// add "moreModules" to the modules object,',
              '// then flag all "chunkIds" as loaded and fire callback',
              'var moduleId, chunkId, i = 0, resolves = [];',
              'for(;i < chunkIds.length; i++) {',
              Template.indent([
                'chunkId = chunkIds[i];',
                'if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {',
                Template.indent('resolves.push(installedChunks[chunkId][0]);'),
                '}',
                'installedChunks[chunkId] = 0;'
              ]),
              '}',
              'for(moduleId in moreModules) {',
              Template.indent([
                'if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {',
                Template.indent(
                  mainTemplate.renderAddModule(
                    hash,
                    chunk,
                    'moduleId',
                    'moreModules[moduleId]'
                  )
                ),
                '}'
              ]),
              '}',
              'if(parentJsonpFunction) parentJsonpFunction(data);',
              'while(resolves.length) {',
              Template.indent('resolves.shift()();'),
              '}',
            ]),
            '};',
          ])
        }
        return source
      }
    )
    mainTemplate.hooks.beforeStartup.tap(
      'WebExtMainTemplatePlugin',
      (source, chunk, hash) => {
        if (needChunkLoadingCode(chunk)) {
          var jsonpFunction = mainTemplate.outputOptions.jsonpFunction
          var globalObject = mainTemplate.outputOptions.globalObject
          return Template.asString([
            `var jsonpArray = ${globalObject}[${JSON.stringify(
              jsonpFunction
            )}] = ${globalObject}[${JSON.stringify(jsonpFunction)}] || [];`,
            'var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);',
            'jsonpArray.push = webpackJsonpCallback;',
            'jsonpArray = jsonpArray.slice();',
            'for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);',
            'var parentJsonpFunction = oldJsonpFunction;',
            '',
            source
          ])
        }
        return source
      }
    )
    mainTemplate.hooks.hotBootstrap.tap(
      'WebExtMainTemplatePlugin',
      (source, chunk, hash) => {
        const globalObject = mainTemplate.outputOptions.globalObject
        const hotUpdateChunkFilename =
          mainTemplate.outputOptions.hotUpdateChunkFilename
        const hotUpdateMainFilename =
          mainTemplate.outputOptions.hotUpdateMainFilename
        const crossOriginLoading = mainTemplate.outputOptions.crossOriginLoading
        const hotUpdateFunction = mainTemplate.outputOptions.hotUpdateFunction
        const currentHotUpdateChunkFilename = mainTemplate.getAssetPath(
          JSON.stringify(hotUpdateChunkFilename),
          {
            hash: `" + ${mainTemplate.renderCurrentHashCode(hash)} + "`,
            hashWithLength: length =>
              `" + ${mainTemplate.renderCurrentHashCode(hash, length)} + "`,
            chunk: {
              id: '" + chunkId + "'
            }
          }
        )
        const currentHotUpdateMainFilename = mainTemplate.getAssetPath(
          JSON.stringify(hotUpdateMainFilename),
          {
            hash: `" + ${mainTemplate.renderCurrentHashCode(hash)} + "`,
            hashWithLength: length =>
              `" + ${mainTemplate.renderCurrentHashCode(hash, length)} + "`
          }
        )
        const runtimeSource = Template.getFunctionContent(
          require('webpack/lib/web/JsonpMainTemplate.runtime')
        )
          .replace(/\/\/\$semicolon/g, ';')
          .replace(/\$require\$/g, mainTemplate.requireFn)
          .replace(
            /\$crossOriginLoading\$/g,
            crossOriginLoading ? JSON.stringify(crossOriginLoading) : 'null'
          )
          .replace(/\$hotMainFilename\$/g, currentHotUpdateMainFilename)
          .replace(/\$hotChunkFilename\$/g, currentHotUpdateChunkFilename)
          .replace(/\$hash\$/g, JSON.stringify(hash))
        return `${source}
function hotDisposeChunk(chunkId) {
	delete installedChunks[chunkId];
}
var parentHotUpdateCallback = ${globalObject}[${JSON.stringify(
          hotUpdateFunction
        )}];
${globalObject}[${JSON.stringify(hotUpdateFunction)}] = ${runtimeSource}`
      }
    )
    mainTemplate.hooks.hash.tap('WebExtMainTemplatePlugin', hash => {
      hash.update('jsonp')
      hash.update('6')
    })
  }
}
module.exports = WebExtMainTemplatePlugin
