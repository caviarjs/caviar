// Block
///////////////////////////////////////////////
const {isString, isFunction, isObject} = require('core-util-is')
const {extend, withPlugins} = require('next-compose-plugins')
const next = require('next')
const {
  SyncHook
} = require('tapable')

const Block = require('../src/block')

const createNextWithPlugins = config => config
  ? extend(config).withPlugins
  : withPlugins

const composeNext = ({
  key,
  prev,
  anchor,
  configFilepath
}) => {
  if (!anchor) {
    return prev
  }

  if (!isFunction(anchor)) {
    throw error()
  }

  // Usage
  // ```js
  // module.exports = withPlugins => withPlugins([...plugins], newConfig)
  // ```
  // withPlugins <- createNextWithPlugins(prev)
  const result = anchor(createNextWithPlugins(prev))

  if (!isFunction(result)) {
    throw error('INVALID_NEXT_RETURN_VALUE', configFilepath)
  }

  return result
}

const composeNextWebpack = () => {
  // TODO
}

// Thinking:
// inherit or delegate?
module.exports = class NextBlock extends Block {
  constructor () {
    super()

    // Orchestrator will check the config structure
    // this.config is a setter
    this.config = {
      next: {
        type: 'compose',
        compose: composeNext
      },

      nextWebpack: {
        type: 'compose',
        compose: composeNextWebpack
      }
    }

    // this.hooks is a setter
    this.hooks = {
      nextConfig: new SyncHook()
    }
  }

  // Override
  // - config `Object` the composed configuration
  // - caviarOptions `Object`
  //   - cwd
  //   - dev
  async _create (config, {dev, cwd}) {
    const nextConfig = config.next(
      phase,
      // {defaultConfig: undefined}
      {}
    )

    this.hooks.config.call(nextConfig)

    return next({
      dev,
      conf: nextConfig,
      dir: cwd
    })
  }

  async _prepare () {
    await this.outlet.prepare()
  }

  // Custom public methods
  middleware () {
    // TODO: outlet ?
    const nextApp = this.outlet
    const handler = nextApp.getRequestHandler()
    const middleware = (req, res) => {
      const {
        [e2k.CONTEXT]: ctx
      } = req

      const {
        params = {},
        url
      } = ctx

      const {
        pathname,
        query
      } = parse(url)

      const parsedUrl = {
        pathname,
        query: {
          ...query,
          ...params
        }
      }

      handler(req, res, parsedUrl)
    }

    return middleware
  }
}
