const reduceNextConfigs = chain => chain.reduce((prev, {
  config: {
    next
  },
  configFile
}) => {
  if (!next) {
    return prev
  }

  const key = 'next'

  if (!isFunction(next)) {
    throw error('INVALID_CONFIG_FIELD', key, configFile, next)
  }

  // Usage
  // ```js
  // module.exports = withPlugins => withPlugins([...plugins], newConfig)
  // ```
  // withPlugins <- createNextWithPlugins(prev)
  const result = next(createNextWithPlugins(prev))

  if (!isFunction(result)) {
    throw error('INVALID_NEXT_RETURN_VALUE', configFile)
  }

  return result
}, UNDEFINED)


