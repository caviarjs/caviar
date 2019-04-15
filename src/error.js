const {
  Errors
} = require('err-object')

const {E, error} = new Errors()

E('DUPLICATE_ENV_KEY', 'env "%s" defined in both server.env and client.env')
E('PRESERVED_ENV_KEY',
  'env "%s" is preserved by roe, and should not be overridden')

E('NOT_IMPLEMENT', 'method "%s" must be implemented')

// E('INVALID_ENV_CONVERTER', 'config.env must be a function, but got %s')

// E('CONFIG_NOT_FOUND', 'module "roe.config" not found in directory "%s"')
E('CONFIG_ERRORED', 'fails to load config file "%s", reason: "%s"')

E('INVALID_SERVER_PATH', 'options.serverPath must be a string, bug got %s')

E('SERVER_NOT_READY', 'server.listen() called before the server is ready')

E('PATH_GETTER_REQUIRED', 'getter "path" is required on Server.prototype')

E('SERVER_PATH_NOT_EXISTS', 'server path "%s" not exists')

E('INVALID_SERVER_PATH', 'server.path must be a string, but got %s')

E('INVALID_CONFIG_NAME', 'server.configFileName must be a string, but got %s')

E('INVALID_CONFIG_FIELD',
  'caviar.config.%s in "%s" must be a function, but got %s')

E('INVALID_CONFIG_FUNC_RESULT',
  'caviar.config.%s in "%s" must returns an object')

// E('INVALID_CONFIG_SERVER', 'caviar.config.server in "%s" must be a function, but got %s')

const NEXT_CONFIG_NOT_FOUND = 'no caviar.config.next is found'
E('NEXT_CONFIG_NOT_FOUND', NEXT_CONFIG_NOT_FOUND)

module.exports = {
  error,
  NEXT_CONFIG_NOT_FOUND
}
