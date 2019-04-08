const {
  Errors
} = require('err-object')

const {E, error} = new Errors()

E('DUPLICATE_ENV_KEY', 'env "%s" defined in both server.env and client.env')
E('PRESERVED_ENV_KEY',
  'env "%s" is preserved by roe, and should not be overridden')

E('NOT_IMPLEMENT', 'method "%s" must be implemented')

E('INVALID_ENV_CONVERTER', 'config.env must be a function, but got %s')

E('CONFIG_NOT_FOUND', 'module "roe.config" not found in directory "%s"')
E('CONFIG_ERRORED', 'fails to load config file "%s", reason: "%s"')

module.exports = {
  error
}
