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

const compose = ({
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

// Thinking:
// inherit or delegate?
module.exports = class NextBlock extends Block {
  constructor () {
    super()

    this.config = {
      next: {
        compose
      }
    }

    this.hooks = {
      nextConfig: new SyncHook()
    }
  }

  // config `Object` the composed configuration
  // caviarOptions `Object`
  async _create (config, caviarOptions) {
    const nextConfig = config.next(
      phase,
      // Just pass an empty string, but in next it passes `{defaultConfig}`
      {}
    )

    this.hooks.nextConfig.call(nextConfig)

    return next({
      // TODO: ?
      dev: caviarOptions.dev,
      conf: nextConfig,
      dir: caviarOptions.dir
    })
  }

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
