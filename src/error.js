const {
  Errors
} = require('err-object')

const {E, error} = new Errors()

E('DUPLICATE_ENV_KEY', 'env "%s" defined in both server.env and client.env')

E('NOT_IMPLEMENT', 'method "%s" must be implemented')

E('INVALID_ENV_CONVERTER', 'config.env must be a function, but got %s')

E('INVALID_NEXT_DIST', 'config.next.distDir must be a string, but got %s')

module.exports = error
