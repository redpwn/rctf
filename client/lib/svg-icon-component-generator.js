const path = require('path')
const { pascalCase } = require('pascal-case')
const { stringifyRequest } = require('loader-utils')

// From JetBrains/svg-sprite-loader/lib/utils/stringify-symbol.js
function stringifySymbol (symbol) {
  return JSON.stringify({
    id: symbol.id,
    use: symbol.useId,
    viewBox: symbol.viewBox,
    content: symbol.render()
  })
}

function stringifySymbolRequest (symbol, request) {
  return stringifyRequest({
    context: path.dirname(symbol.request.file)
  }, request)
}

// From JetBrains/svg-sprite-loader/examples/custom-runtime-generator/
module.exports = function runtimeGenerator ({ symbol, config, loaderContext }) {
  const { spriteModule, symbolModule, runtimeOptions } = config
  const compilerContext = loaderContext._compiler.context

  const iconModulePath = path.resolve(compilerContext, runtimeOptions.iconModule)
  const iconModuleRequest = stringifySymbolRequest(symbol, iconModulePath)

  const spriteRequest = stringifySymbolRequest(symbol, spriteModule)
  const symbolRequest = stringifySymbolRequest(symbol, symbolModule)
  const parentComponentDisplayName = 'SpriteSymbolComponent'
  const displayName = `${pascalCase(symbol.id)}${parentComponentDisplayName}`

  // Use h syntax to avoid needing a separate Babel transpile
  return `
    import { h } from 'preact'
    import SpriteSymbol from ${symbolRequest}
    import sprite from ${spriteRequest}
    import ${parentComponentDisplayName} from ${iconModuleRequest}

    const symbol = new SpriteSymbol(${stringifySymbol(symbol)})
    sprite.add(symbol)
    export default function ${displayName} (props) {
      return h(${parentComponentDisplayName}, {
        ...props,
        glyph: "${symbol.id}",
        viewBox: "${symbol.viewBox}"
      });
    }
  `
}
